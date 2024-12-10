import { BlobServiceClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Ensure connection string is available
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connectionString) {
  logger.error('Azure Storage connection string is not defined in environment variables.');
  throw new Error('Azure Storage connection string is not defined');
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Define container names in an object for easy management
export const containers = {
  LOGISTICS: process.env.AZURE_CONTAINER_LOGISTICS,
  CHALLAN: process.env.AZURE_CONTAINER_CHALLAN,
  INSTALLATION: process.env.AZURE_CONTAINER_INSTALLATION,
  INVOICE: process.env.AZURE_CONTAINER_INVOICE
};

// Helper function to check if the container exists and create if not
async function ensureContainerExists(containerName) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const exists = await containerClient.exists();
  
  if (!exists) {
    await containerClient.create({
      access: 'blob' // Allow public read access to blobs only
    });
    logger.info(`Container ${containerName} created`);
  }
}

// Create necessary containers if they do not exist
export async function createContainers() {
  try {
    for (const containerName of Object.values(containers)) {
      await ensureContainerExists(containerName);
    }
  } catch (error) {
    logger.error('Error initializing Azure containers:', error);
    throw error;
  }
}

// Upload file to Azure Blob Storage
export async function uploadFile(file, containerName) {
  // Validate the file and container name
  if (!file?.buffer) {
    throw new Error('Invalid file data');
  }

  if (!Object.values(containers).includes(containerName)) {
    throw new Error('Invalid container name');
  }

  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobName = `${uuidv4()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload file to the blob storage
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype
      }
    });

    logger.info(`File uploaded successfully to ${containerName}/${blobName}`);
    return blockBlobClient.url;
  } catch (error) {
    logger.error('Error uploading file to Azure:', error);
    throw new Error('Failed to upload file to Azure Storage');
  }
}

// Delete a file from Azure Blob Storage using the file URL
export async function deleteAzureFile(url) {
  try {
    const { containerName, blobName } = parseBlobUrl(url);

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Check if the blob exists before attempting to delete
    const exists = await blockBlobClient.exists();
    if (!exists) {
      logger.warn(`File not found: ${containerName}/${blobName}`);
      throw new Error(`File not found: ${containerName}/${blobName}`);
    }

    // Proceed to delete the file
    await blockBlobClient.delete();
    logger.info(`File deleted successfully: ${containerName}/${blobName}`);
  } catch (error) {
    logger.error('Error deleting file from Azure:', error);
    // Rethrow specific error messages for better context
    if (error.message.includes('File not found')) {
      throw new Error(error.message);
    }
    throw new Error(`Failed to delete file from Azure Storage. Error: ${error.message}`);
  }
}

// Helper function to parse the blob URL and extract container and blob name
function parseBlobUrl(url) {
  const urlObj = new URL(url);
  const pathSegments = urlObj.pathname.split('/').filter(Boolean);
  
  if (pathSegments.length < 2) {
    throw new Error('Invalid file URL format: Expected container and blob name');
  }

  const containerName = pathSegments[0];
  const blobName = pathSegments.slice(1).join('/'); // In case the blob name contains subdirectories

  if (!Object.values(containers).includes(containerName)) {
    throw new Error(`Invalid container name: ${containerName}`);
  }

  return { containerName, blobName };
}
