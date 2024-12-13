import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';
import dotenv from 'dotenv';

dotenv.config();

class AzureStorageService {
  constructor() {
    this.validateConfig();
    this.initializeClient();
  }

  validateConfig() {
    const requiredEnvVars = [
      'AZURE_STORAGE_ACCOUNT',
      'AZURE_STORAGE_ACCESS_KEY',
      'AZURE_CONTAINER_LOGISTICS',
      'AZURE_CONTAINER_CHALLAN',
      'AZURE_CONTAINER_INSTALLATION',
      'AZURE_CONTAINER_INVOICE'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  initializeClient() {
    const credential = new StorageSharedKeyCredential(
      process.env.AZURE_STORAGE_ACCOUNT,
      process.env.AZURE_STORAGE_ACCESS_KEY
    );

    this.blobServiceClient = new BlobServiceClient(
      `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
      credential
    );

    this.containers = {
      LOGISTICS: process.env.AZURE_CONTAINER_LOGISTICS,
      CHALLAN: process.env.AZURE_CONTAINER_CHALLAN,
      INSTALLATION: process.env.AZURE_CONTAINER_INSTALLATION,
      INVOICE: process.env.AZURE_CONTAINER_INVOICE
    };
  }

  async initializeContainers() {
    try {
      const initPromises = Object.values(this.containers).map(containerName =>
        this.ensureContainerExists(containerName)
      );
      await Promise.all(initPromises);
      logger.info('Azure storage containers initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Azure storage containers:', error);
      throw error;
    }
  }

  async ensureContainerExists(containerName) {
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const exists = await containerClient.exists();
    
    if (!exists) {
      await containerClient.create({
        access: 'blob',
        metadata: { createdDate: new Date().toISOString() }
      });
      logger.info(`Created container: ${containerName}`);
    }
  }

  async uploadFile(file, containerName) {
    if (!file?.buffer) {
      throw new Error('Invalid file data');
    }

    if (!this.containers[containerName]) {
      throw new Error(`Invalid container name: ${containerName}`);
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(
        this.containers[containerName]
      );
      
      const blobName = this.generateBlobName(file);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      const contentType = file.mimetype || 'application/octet-stream';
      const options = {
        blobHTTPHeaders: {
          blobContentType: contentType,
          blobContentDisposition: `inline; filename="${file.originalname}"`
        },
        metadata: {
          originalName: file.originalname,
          uploadDate: new Date().toISOString()
        }
      };

      await blockBlobClient.uploadData(file.buffer, options);
      logger.info(`File uploaded successfully: ${containerName}/${blobName}`);
      
      return {
        url: blockBlobClient.url,
        name: blobName,
        contentType,
        size: file.size
      };
    } catch (error) {
      logger.error('Error uploading file to Azure:', error);
      throw new Error('Failed to upload file to Azure Storage');
    }
  }

  async deleteFile(url) {
    try {
      const { containerName, blobName } = this.parseBlobUrl(url);
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const exists = await blockBlobClient.exists();
      if (!exists) {
        throw new Error(`File not found: ${containerName}/${blobName}`);
      }

      await blockBlobClient.delete();
      logger.info(`File deleted successfully: ${containerName}/${blobName}`);
      
      return true;
    } catch (error) {
      logger.error('Error deleting file from Azure:', error);
      throw error;
    }
  }

  parseBlobUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      
      if (pathSegments.length < 2) {
        throw new Error('Invalid blob URL format');
      }

      const containerName = pathSegments[0];
      const blobName = pathSegments.slice(1).join('/');

      if (!Object.values(this.containers).includes(containerName)) {
        throw new Error(`Invalid container name: ${containerName}`);
      }

      return { containerName, blobName };
    } catch (error) {
      throw new Error(`Invalid blob URL: ${error.message}`);
    }
  }

  generateBlobName(file) {
    const timestamp = Date.now();
    const uuid = uuidv4();
    const extension = file.originalname.split('.').pop();
    return `${timestamp}-${uuid}.${extension}`;
  }
}

// Create singleton instance
const azureStorage = new AzureStorageService();

// Export initialization method
export const initializeStorage = async () => {
  try {
    await azureStorage.initializeContainers();
    logger.info('Azure Storage initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Azure Storage:', error);
    throw error;
  }
};

export default azureStorage;
export const containers = azureStorage.containers;
