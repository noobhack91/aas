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
    isActive: {  
      type: DataTypes.BOOLEAN,  
      defaultValue: true  
    }  
  }, {  
    tableName: 'accessories',  
    underscored: true,  
    timestamps: true  
  });  

  return Accessory;  
};  
