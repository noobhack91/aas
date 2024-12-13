// server/models/definitions/Accessory.js  
import { DataTypes } from 'sequelize';

export default (sequelize) => {  
  const Accessory = sequelize.define('Accessory', {  
    id: {  
      type: DataTypes.UUID,  
      defaultValue: DataTypes.UUIDV4,  
      primaryKey: true  
    },  
    name: {  
      type: DataTypes.STRING,  
      allowNull: false,  
      unique: true  
    },  
    description: {  
      type: DataTypes.TEXT,  
      allowNull: true  
    },  
    documents: {  
      type: DataTypes.ARRAY(DataTypes.STRING),  
      defaultValue: []  
    },  
    isActive: {  
      type: DataTypes.BOOLEAN,  
      defaultValue: true  
    }  
  }, {  
    tableName: 'accessories',  
    timestamps: true  
  });  

  return Accessory;  
};  
