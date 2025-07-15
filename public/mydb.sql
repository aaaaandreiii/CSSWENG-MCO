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
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8mb4 ;
USE `mydb` ;

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
  `cost` DOUBLE NOT NULL,
  `retailPrice` DOUBLE NOT NULL,
  `stockOnHand` INT NULL DEFAULT '0',
  `units` ENUM('pcs', 'boxes', 'cases', 'packs', 'bundles', 'crates', 'meters', 'centimeters', 'square meters', 'rolls', 'spools', 'sets', 'other') NULL DEFAULT NULL,
  `lastEditedDate` DATETIME NULL DEFAULT NULL,
  `lastEditedUser` INT NULL DEFAULT NULL,
  `deleteFlag` TINYINT NOT NULL,
  PRIMARY KEY (`productId`),
  INDEX `fk_Product_lastEditedUser` (`lastEditedUser` ASC) VISIBLE,
  CONSTRAINT `fk_Product_lastEditedUser`
    FOREIGN KEY (`lastEditedUser`)
    REFERENCES `mydb`.`Users` (`userId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


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
  `deleteFlag` TINYINT NOT NULL,
  PRIMARY KEY (`userId`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


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
  `deleteFlag` TINYINT NOT NULL,
  PRIMARY KEY (`entryId`),
  INDEX `fk_StockEntry_Users1_idx` (`receivedBy`),
  INDEX `fk_StockEntry_Product1_idx` (`productId`),
  INDEX `fk_StockEntry_lastEditedUser` (`lastEditedUser`),
  CONSTRAINT `fk_StockEntry_lastEditedUser`
    FOREIGN KEY (`lastEditedUser`)
    REFERENCES `mydb`.`Users` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_StockEntry_Product1`
    FOREIGN KEY (`productId`)
    REFERENCES `mydb`.`Product` (`productId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_StockEntry_Users1`
    FOREIGN KEY (`receivedBy`)
    REFERENCES `mydb`.`Users` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- comments from Andrei:
  -- there are so many ommitted attributes in the original table declaration
  -- that i just commented out those that do not match up 
  -- with what were previously declared in ching man's implementation

-- -----------------------------------------------------
-- Table `mydb`.`StockWithdrawal`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`StockWithdrawal` ;

CREATE TABLE IF NOT EXISTS `mydb`.`StockWithdrawal` (
  `withdrawalId` INT NOT NULL AUTO_INCREMENT,
  `dateWithdrawn` DATE NOT NULL,
  `quantityWithdrawn` VARCHAR(45) NOT NULL,
  `purpose` VARCHAR(45) NOT NULL,
  `entryId` INT NOT NULL,  -- `productId` INT NOT NULL,                      -- called entryID in ching man's
  `withdrawnBy` INT NOT NULL,
  `authorizedBy` INT NOT NULL,
  -- `stockEntryId` INT NULL DEFAULT NULL,  -- not in ching man's
  `lastEditedDate` DATETIME NULL DEFAULT NULL,
  `lastEditedUser` INT NULL DEFAULT NULL,
  `deleteFlag` TINYINT NOT NULL,
  PRIMARY KEY (`withdrawalId`),
  -- INDEX `fk_StockWithdrawal_Product1_idx` (`productId` ASC) VISIBLE,      -- not in ching man's
  INDEX `fk_StockWithdrawal_Users2_idx` (`withdrawnBy` ASC) VISIBLE,
  INDEX `fk_StockWithdrawal_Users1_idx` (`authorizedBy` ASC) VISIBLE,
  INDEX `fk_StockWithdrawal_StockEntry1_idx` (`entryId` ASC) VISIBLE,  
  -- INDEX `fk_StockWithdrawal_StockEntry` (`stockEntryId` ASC) VISIBLE,     -- different foreign key name in ching man's
  INDEX `fk_StockWithdrawal_lastEditedUser` (`lastEditedUser` ASC) VISIBLE,
  CONSTRAINT `fk_StockWithdrawal_lastEditedUser`
    FOREIGN KEY (`lastEditedUser`)
    REFERENCES `mydb`.`Users` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  -- CONSTRAINT `fk_StockWithdrawal_Product1`                                -- not in ching man's
  --   FOREIGN KEY (`productId`)
  --   REFERENCES `mydb`.`Product` (`productId`),
  CONSTRAINT `fk_StockWithdrawal_StockEntry1`                                -- previously called fk_StockWithdrawal_StockEntry
    FOREIGN KEY (`entryId`)
    REFERENCES `mydb`.`StockEntry` (`entryId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_StockWithdrawal_Users1`
    FOREIGN KEY (`authorizedBy`)
    REFERENCES `mydb`.`Users` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_StockWithdrawal_Users2`
    FOREIGN KEY (`withdrawnBy`)
    REFERENCES `mydb`.`Users` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `mydb`.`Orders`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`Orders` ;

CREATE TABLE IF NOT EXISTS `mydb`.`Orders` (
  `orderId` INT UNIQUE NOT NULL AUTO_INCREMENT,
  `discount` FLOAT NULL DEFAULT NULL,
  `customer` VARCHAR(45) NOT NULL,
  `handledBy` INT NOT NULL,
  -- `totalAmount` DOUBLE NULL DEFAULT NULL,  -- not in ching man's
  `paymentMethod` VARCHAR(50) NULL DEFAULT NULL,
  `paymentStatus` ENUM('pending', 'paid', 'failed') NULL DEFAULT 'pending',
  `lastEditedDate` DATETIME NULL DEFAULT NULL,
  `lastEditedUser` INT NULL DEFAULT NULL,
  `dateOrdered` DATE NOT NULL,
  `deleteFlag` TINYINT NOT NULL,
  PRIMARY KEY (`orderId`),
  INDEX `fk_Sales_Users1_idx` (`handledBy`) VISIBLE,
  INDEX `fk_Orders_lastEditedUser` (`lastEditedUser`) VISIBLE,
  CONSTRAINT `fk_Orders_lastEditedUser`
    FOREIGN KEY (`lastEditedUser`)
    REFERENCES `mydb`.`Users` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Sales_Users1`
    FOREIGN KEY (`handledBy`)
    REFERENCES `mydb`.`Users` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


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
  `deleteFlag` TINYINT NOT NULL,
  PRIMARY KEY (`orderInfoId`, `orderId`, `productId`),
  INDEX `fk_OrderInfo_Sales_idx` (`orderId` ASC) VISIBLE,
  INDEX `fk_OrderInfo_Product1_idx` (`productId` ASC) VISIBLE,
  INDEX `fk_OrderInfo_lastEditedUser` (`lastEditedUser` ASC) VISIBLE,
  CONSTRAINT `fk_OrderInfo_lastEditedUser`
    FOREIGN KEY (`lastEditedUser`)
    REFERENCES `mydb`.`Users` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_OrderInfo_Product1`
    FOREIGN KEY (`productId`)
    REFERENCES `mydb`.`Product` (`productId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_OrderInfo_Sales`
    FOREIGN KEY (`orderId`)
    REFERENCES `mydb`.`Orders` (`orderId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


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
  `deleteFlag` TINYINT NOT NULL,
  PRIMARY KEY (`transactionId`),
  INDEX `fk_ReturnExchangeRecord_Users1_idx` (`handledBy` ASC) VISIBLE,
  INDEX `fk_ReturnExchangeRecord_Users2_idx` (`approvedBy` ASC) VISIBLE,
  INDEX `fk_ReturnExchangeRecord_Sales1_idx` (`orderId` ASC) VISIBLE,
  INDEX `fk_ReturnExchange_lastEditedUser` (`lastEditedUser` ASC) VISIBLE,
  CONSTRAINT `fk_ReturnExchange_lastEditedUser`
    FOREIGN KEY (`lastEditedUser`)
    REFERENCES `mydb`.`Users` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_ReturnExchangeRecord_Sales1`
    FOREIGN KEY (`orderId`)
    REFERENCES `mydb`.`Orders` (`orderId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_ReturnExchangeRecord_Users1`
    FOREIGN KEY (`handledBy`)
    REFERENCES `mydb`.`Users` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_ReturnExchangeRecord_Users2`
    FOREIGN KEY (`approvedBy`)
    REFERENCES `mydb`.`Users` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


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
  `deleteFlag` TINYINT NOT NULL,
  PRIMARY KEY (`detailId`, `returnedProductId`, `transactionId`),
  INDEX `fk_ReturnExchangeDetail_Product1_idx` (`returnedProductId` ASC) VISIBLE,
  INDEX `fk_ReturnExchangeDetail_ReturnExchangeRecord1_idx` (`transactionId` ASC) VISIBLE,
  INDEX `fk_ReturnExchangeInfo_Product1_idx` (`exchangeProductId` ASC) VISIBLE,
  INDEX `fk_ReturnExchangeInfo_lastEditedUser` (`lastEditedUser` ASC) VISIBLE,
  CONSTRAINT `fk_ReturnExchangeDetail_Product1`
    FOREIGN KEY (`returnedProductId`)
    REFERENCES `mydb`.`Product` (`productId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_ReturnExchangeDetail_ReturnExchangeRecord1`
    FOREIGN KEY (`transactionId`)
    REFERENCES `mydb`.`ReturnExchange` (`transactionId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_ReturnExchangeInfo_lastEditedUser`
    FOREIGN KEY (`lastEditedUser`)
    REFERENCES `mydb`.`Users` (`userId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_ReturnExchangeInfo_Product1`
    FOREIGN KEY (`exchangeProductId`)
    REFERENCES `mydb`.`Product` (`productId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;