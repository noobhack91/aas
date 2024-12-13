// server/models/definitions/Consumable.js  
import { DataTypes } from 'sequelize';  

export default (sequelize) => {  
  const Consumable = sequelize.define('Consumable', {  
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
    tableName: 'consumables',  
    timestamps: true  
  });  

  return Consumable;  
};  