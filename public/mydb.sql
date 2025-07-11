-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8mb3 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`Users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Users` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Users` (
  `userId` INT NOT NULL AUTO_INCREMENT,
  `fullName` VARCHAR(45) NOT NULL,
  `userRole` ENUM('admin', 'staff', 'auditor', 'manager') NOT NULL,
  `username` VARCHAR(45) NOT NULL,
  `userPassword` VARCHAR(255) NOT NULL,
  `dateAdded` DATE NOT NULL,
  `userStatus` ENUM('active', 'inactive') NOT NULL,
  PRIMARY KEY (`userId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `mydb`.`Product`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Product` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Product` (
  `productId` INT NOT NULL AUTO_INCREMENT,
  `productName` VARCHAR(45) NOT NULL,
  `category` VARCHAR(45) NOT NULL,
  `descriptions` VARCHAR(45) NOT NULL,
  `supplier` VARCHAR(45) NOT NULL,
  `productStatus` ENUM('active', 'discontinued') NOT NULL,
  `cost` DOUBLE NOT NULL,
  `retailPrice` DOUBLE NOT NULL,
  `stockOnHand` INT NULL DEFAULT '0',
  `units` VARCHAR(20) NULL DEFAULT NULL,
  `lastEditedDate` DATETIME NULL DEFAULT NULL,
  `lastEditedUser` INT NULL DEFAULT NULL,
  PRIMARY KEY (`productId`),
  INDEX `fk_Product_lastEditedUser` (`lastEditedUser` ASC) VISIBLE,
  CONSTRAINT `fk_Product_lastEditedUser`
    FOREIGN KEY (`lastEditedUser`)
    REFERENCES `mydb`.`Users` (`userId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `mydb`.`Orders`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Orders` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Orders` (
  `orderId` INT NOT NULL AUTO_INCREMENT,
  `discount` FLOAT NULL DEFAULT NULL,
  `customer` VARCHAR(45) NOT NULL,
  `handledBy` INT NOT NULL,
  `totalAmount` DOUBLE NULL DEFAULT NULL,
  `paymentMethod` VARCHAR(50) NULL DEFAULT NULL,
  `paymentStatus` ENUM('pending', 'paid', 'failed') NULL DEFAULT 'pending',
  `lastEditedDate` DATETIME NULL DEFAULT NULL,
  `lastEditedUser` INT NULL DEFAULT NULL,
  PRIMARY KEY (`orderId`, `handledBy`),
  INDEX `fk_Sales_Users1_idx` (`handledBy` ASC) VISIBLE,
  INDEX `fk_Orders_lastEditedUser` (`lastEditedUser` ASC) VISIBLE,
  CONSTRAINT `fk_Orders_lastEditedUser`
    FOREIGN KEY (`lastEditedUser`)
    REFERENCES `mydb`.`Users` (`userId`),
  CONSTRAINT `fk_Sales_Users1`
    FOREIGN KEY (`handledBy`)
    REFERENCES `mydb`.`Users` (`userId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `mydb`.`OrderInfo`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`OrderInfo` ;

CREATE TABLE IF NOT EXISTS `mydb`.`OrderInfo` (
  `orderInfoId` INT NOT NULL AUTO_INCREMENT,
  `quantity` INT NOT NULL,
  `orderId` INT NOT NULL,
  `productId` INT NOT NULL,
  `unitPriceAtPurchase` DOUBLE NULL DEFAULT NULL,
  `lastEditedDate` DATETIME NULL DEFAULT NULL,
  `lastEditedUser` INT NULL DEFAULT NULL,
  PRIMARY KEY (`orderInfoId`, `orderId`, `productId`),
  INDEX `fk_OrderInfo_Sales_idx` (`orderId` ASC) VISIBLE,
  INDEX `fk_OrderInfo_Product1_idx` (`productId` ASC) VISIBLE,
  INDEX `fk_OrderInfo_lastEditedUser` (`lastEditedUser` ASC) VISIBLE,
  CONSTRAINT `fk_OrderInfo_lastEditedUser`
    FOREIGN KEY (`lastEditedUser`)
    REFERENCES `mydb`.`Users` (`userId`),
  CONSTRAINT `fk_OrderInfo_Product1`
    FOREIGN KEY (`productId`)
    REFERENCES `mydb`.`Product` (`productId`),
  CONSTRAINT `fk_OrderInfo_Sales`
    FOREIGN KEY (`orderId`)
    REFERENCES `mydb`.`Orders` (`orderId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `mydb`.`ReturnExchange`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`ReturnExchange` ;

CREATE TABLE IF NOT EXISTS `mydb`.`ReturnExchange` (
  `transactionId` INT NOT NULL,
  `dateTransaction` DATE NOT NULL,
  `transactionStatus` ENUM('refunded', 'replaced', 'denied') NOT NULL,
  `orderId` INT NOT NULL,
  `handledBy` INT NOT NULL,
  `approvedBy` INT NOT NULL,
  `lastEditedDate` DATETIME NULL DEFAULT NULL,
  `lastEditedUser` INT NULL DEFAULT NULL,
  PRIMARY KEY (`transactionId`, `orderId`, `handledBy`, `approvedBy`),
  INDEX `fk_ReturnExchangeRecord_Users1_idx` (`handledBy` ASC) VISIBLE,
  INDEX `fk_ReturnExchangeRecord_Users2_idx` (`approvedBy` ASC) VISIBLE,
  INDEX `fk_ReturnExchangeRecord_Sales1_idx` (`orderId` ASC) VISIBLE,
  INDEX `fk_ReturnExchange_lastEditedUser` (`lastEditedUser` ASC) VISIBLE,
  CONSTRAINT `fk_ReturnExchange_lastEditedUser`
    FOREIGN KEY (`lastEditedUser`)
    REFERENCES `mydb`.`Users` (`userId`),
  CONSTRAINT `fk_ReturnExchangeRecord_Sales1`
    FOREIGN KEY (`orderId`)
    REFERENCES `mydb`.`Orders` (`orderId`),
  CONSTRAINT `fk_ReturnExchangeRecord_Users1`
    FOREIGN KEY (`handledBy`)
    REFERENCES `mydb`.`Users` (`userId`),
  CONSTRAINT `fk_ReturnExchangeRecord_Users2`
    FOREIGN KEY (`approvedBy`)
    REFERENCES `mydb`.`Users` (`userId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `mydb`.`ReturnExchangeInfo`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`ReturnExchangeInfo` ;

CREATE TABLE IF NOT EXISTS `mydb`.`ReturnExchangeInfo` (
  `detailId` INT NOT NULL AUTO_INCREMENT,
  `returnedProductId` INT NOT NULL,
  `returnedQuantity` INT NOT NULL,
  `exchangeProductId` INT NULL DEFAULT NULL,
  `exchangeQuantity` INT NULL DEFAULT NULL,
  `reason` VARCHAR(45) NOT NULL,
  `transactionId` INT NOT NULL,
  `returnType` ENUM('Return', 'Exchange', 'Warranty') NULL DEFAULT 'Return',
  `lastEditedDate` DATETIME NULL DEFAULT NULL,
  `lastEditedUser` INT NULL DEFAULT NULL,
  PRIMARY KEY (`detailId`, `returnedProductId`, `transactionId`),
  INDEX `fk_ReturnExchangeDetail_Product1_idx` (`returnedProductId` ASC) VISIBLE,
  INDEX `fk_ReturnExchangeDetail_ReturnExchangeRecord1_idx` (`transactionId` ASC) VISIBLE,
  INDEX `fk_ReturnExchangeInfo_Product1_idx` (`exchangeProductId` ASC) VISIBLE,
  INDEX `fk_ReturnExchangeInfo_lastEditedUser` (`lastEditedUser` ASC) VISIBLE,
  CONSTRAINT `fk_ReturnExchangeDetail_Product1`
    FOREIGN KEY (`returnedProductId`)
    REFERENCES `mydb`.`Product` (`productId`),
  CONSTRAINT `fk_ReturnExchangeDetail_ReturnExchangeRecord1`
    FOREIGN KEY (`transactionId`)
    REFERENCES `mydb`.`ReturnExchange` (`transactionId`),
  CONSTRAINT `fk_ReturnExchangeInfo_lastEditedUser`
    FOREIGN KEY (`lastEditedUser`)
    REFERENCES `mydb`.`Users` (`userId`),
  CONSTRAINT `fk_ReturnExchangeInfo_Product1`
    FOREIGN KEY (`exchangeProductId`)
    REFERENCES `mydb`.`Product` (`productId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `mydb`.`StockEntry`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`StockEntry` ;

CREATE TABLE IF NOT EXISTS `mydb`.`StockEntry` (
  `entryId` INT NOT NULL AUTO_INCREMENT,
  `branchName` VARCHAR(45) NOT NULL,
  `dateReceived` DATE NOT NULL,
  `quantityReceived` INT NOT NULL,
  `deliveryReceiptNumber` INT NOT NULL,
  `receivedBy` INT NOT NULL,
  `productId` INT NOT NULL,
  `lastEditedDate` DATETIME NULL DEFAULT NULL,
  `lastEditedUser` INT NULL DEFAULT NULL,
  PRIMARY KEY (`entryId`, `receivedBy`, `productId`),
  INDEX `fk_StockEntry_Users1_idx` (`receivedBy` ASC) VISIBLE,
  INDEX `fk_StockEntry_Product1_idx` (`productId` ASC) VISIBLE,
  INDEX `fk_StockEntry_lastEditedUser` (`lastEditedUser` ASC) VISIBLE,
  CONSTRAINT `fk_StockEntry_lastEditedUser`
    FOREIGN KEY (`lastEditedUser`)
    REFERENCES `mydb`.`Users` (`userId`),
  CONSTRAINT `fk_StockEntry_Product1`
    FOREIGN KEY (`productId`)
    REFERENCES `mydb`.`Product` (`productId`),
  CONSTRAINT `fk_StockEntry_Users1`
    FOREIGN KEY (`receivedBy`)
    REFERENCES `mydb`.`Users` (`userId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `mydb`.`StockWithdrawal`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`StockWithdrawal` ;

CREATE TABLE IF NOT EXISTS `mydb`.`StockWithdrawal` (
  `withdrawalId` INT NOT NULL AUTO_INCREMENT,
  `dateWithdrawn` DATE NOT NULL,
  `quantityWithdrawn` VARCHAR(45) NOT NULL,
  `purpose` VARCHAR(45) NOT NULL,
  `productId` INT NOT NULL,
  `withdrawnBy` INT NOT NULL,
  `authorizedBy` INT NOT NULL,
  `stockEntryId` INT NULL DEFAULT NULL,
  `lastEditedDate` DATETIME NULL DEFAULT NULL,
  `lastEditedUser` INT NULL DEFAULT NULL,
  PRIMARY KEY (`withdrawalId`, `productId`, `withdrawnBy`, `authorizedBy`),
  INDEX `fk_StockWithdrawal_Product1_idx` (`productId` ASC) VISIBLE,
  INDEX `fk_StockWithdrawal_Users2_idx` (`withdrawnBy` ASC) VISIBLE,
  INDEX `fk_StockWithdrawal_Users1_idx` (`authorizedBy` ASC) VISIBLE,
  INDEX `fk_StockWithdrawal_StockEntry` (`stockEntryId` ASC) VISIBLE,
  INDEX `fk_StockWithdrawal_lastEditedUser` (`lastEditedUser` ASC) VISIBLE,
  CONSTRAINT `fk_StockWithdrawal_lastEditedUser`
    FOREIGN KEY (`lastEditedUser`)
    REFERENCES `mydb`.`Users` (`userId`),
  CONSTRAINT `fk_StockWithdrawal_Product1`
    FOREIGN KEY (`productId`)
    REFERENCES `mydb`.`Product` (`productId`),
  CONSTRAINT `fk_StockWithdrawal_StockEntry`
    FOREIGN KEY (`stockEntryId`)
    REFERENCES `mydb`.`StockEntry` (`entryId`),
  CONSTRAINT `fk_StockWithdrawal_Users1`
    FOREIGN KEY (`authorizedBy`)
    REFERENCES `mydb`.`Users` (`userId`),
  CONSTRAINT `fk_StockWithdrawal_Users2`
    FOREIGN KEY (`withdrawnBy`)
    REFERENCES `mydb`.`Users` (`userId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
