import { sequelize, User } from './models/index.js';  

const createSuperAdmin = async () => {  
  try {  
    await sequelize.sync(); // Ensure database is synced  

    const superAdmin = await User.create({  
      username: 'superadmin',  
      email: 'superadmin@example.com',  
      password: 'SuperSecurePassword123',  
      roles: ['super_admin'], // Assign super admin role  
      isActive: true  
    });  

    console.log('Super admin created:', superAdmin);  
  } catch (error) {  
    console.error('Error creating super admin:', error);  
  } finally {  
    await sequelize.close();  
  }  
};  

createSuperAdmin();  