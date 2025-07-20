SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;

-- Create temporary sequence table
DROP TEMPORARY TABLE IF EXISTS seq;
CREATE TEMPORARY TABLE seq (n INT PRIMARY KEY);

-- Populate sequence 1 to 50
INSERT INTO seq (n)
VALUES 
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),
(11),(12),(13),(14),(15),(16),(17),(18),(19),(20),
(21),(22),(23),(24),(25),(26),(27),(28),(29),(30),
(31),(32),(33),(34),(35),(36),(37),(38),(39),(40),
(41),(42),(43),(44),(45),(46),(47),(48),(49),(50);

-- populate Users
INSERT INTO `mydb`.`Users`
  (fullName, userRole, username, userPassword, pathName, dateAdded, lastEditedDate, lastEditedUser, deleteFlag)
SELECT
  CONCAT('User ', n),
  ELT((n % 4) + 1, 'admin','staff','auditor','manager'),
  CONCAT('user', n),
  CONCAT('pass', LPAD(n,2,'0')),
  NULL,
  CURDATE() - INTERVAL (n % 180) DAY,
  NOW() - INTERVAL (n % 1440) MINUTE,
  ((n % 50) + 1),
  0
FROM seq;

-- populate Product
INSERT INTO `mydb`.`Product`
  (productName, category, descriptions, supplier, cost, retailPrice, stockOnHand, units, pathName, lastEditedDate, lastEditedUser, deleteFlag)
SELECT
  CONCAT('Product ', n),
  ELT((n % 5) + 1, 'Electronics','Furniture','Clothing','Food','Books'),
  CONCAT('Description for product ', n),
  ELT((n % 5) + 1, 'SupplierA','SupplierB','SupplierC','SupplierD','SupplierE'),
  ROUND(10 + RAND() * 90, 2),
  ROUND((10 + RAND() * 90) * 1.2, 2),
  FLOOR(RAND() * 100),
  ELT((n % 12) + 1, 'pcs','boxes','cases','packs','bundles','crates','meters','centimeters','square meters','rolls','spools','sets'),
  NULL,
  NOW() - INTERVAL (n % 365) DAY,
  ((n % 50) + 1),
  0
FROM seq;

-- populate StockEntry
INSERT INTO `mydb`.`StockEntry`
  (branchName, dateReceived, quantityReceived, deliveryReceiptNumber, receivedBy, productId, lastEditedDate, lastEditedUser, deleteFlag)
SELECT
  ELT((n % 3) + 1, 'Main','East','West'),
  CURDATE() - INTERVAL (n % 30) DAY,
  FLOOR(RAND() * 100) + 1,
  1000 + n,
  ((n % 50) + 1),
  ((n % 50) + 1),
  NOW() - INTERVAL (n % 10) DAY,
  ((n % 50) + 1),
  0
FROM seq;

-- populate StockWithdrawal
INSERT INTO `mydb`.`StockWithdrawal`
  (dateWithdrawn, quantityWithdrawn, purpose, entryId, withdrawnBy, authorizedBy, lastEditedDate, lastEditedUser, deleteFlag)
SELECT
  CURDATE() - INTERVAL (n % 30) DAY,
  CAST(FLOOR(RAND() * 50) + 1 AS CHAR),
  ELT((n % 4) + 1, 'Sale','Damage','Return','Other'),
  n,
  ((n % 50) + 1),
  (((n + 1) % 50) + 1),
  NOW() - INTERVAL (n % 5) DAY,
  ((n % 50) + 1),
  0
FROM seq;

-- populate Orders
INSERT INTO `mydb`.`Orders`
  (discount, customer, handledBy, paymentMethod, paymentStatus, dateOrdered, lastEditedDate, lastEditedUser, deleteFlag)
SELECT
  ROUND(RAND() * 20, 2),
  CONCAT('Customer ', n),
  ((n % 50) + 1),
  ELT((n % 4) + 1, 'debit card','credit card','cash','online payment'),
  ELT((n % 3) + 1, 'pending','paid','failed'),
  CURDATE() - INTERVAL (n % 30) DAY,
  NOW() - INTERVAL (n % 7) DAY,
  ((n % 50) + 1),
  0
FROM seq;

-- populate OrderInfo
INSERT INTO `mydb`.`OrderInfo`
  (quantity, orderId, productId, unitPriceAtPurchase, lastEditedDate, lastEditedUser, deleteFlag)
SELECT
  FLOOR(RAND() * 10) + 1,
  ((n % 50) + 1),
  (((n + 10) % 50) + 1),
  ROUND(10 + RAND() * 90, 2),
  NOW() - INTERVAL (n % 7) HOUR,
  ((n % 50) + 1),
  0
FROM seq;

-- populate ReturnExchange
INSERT INTO `mydb`.`ReturnExchange`
  (transactionId, dateTransaction, transactionStatus, orderId, handledBy, approvedBy, lastEditedDate, lastEditedUser, deleteFlag)
SELECT
  n,
  CURDATE() - INTERVAL (n % 30) DAY,
  ELT((n % 3) + 1, 'refunded','replaced','denied'),
  ((n % 50) + 1),
  ((n % 50) + 1),
  (((n + 1) % 50) + 1),
  NOW() - INTERVAL (n % 7) HOUR,
  ((n % 50) + 1),
  0
FROM seq;

-- populate ReturnExchangeInfo
INSERT INTO `mydb`.`ReturnExchangeInfo`
  (returnedProductId, returnedQuantity, exchangeProductId, exchangeQuantity, reason, transactionId, returnType, lastEditedDate, lastEditedUser, deleteFlag)
SELECT
  (((n + 5) % 50) + 1),
  FLOOR(RAND() * 5) + 1,
  CASE WHEN (n % 2)=0 THEN (((n + 10) % 50) + 1) ELSE NULL END,
  CASE WHEN (n % 2)=0 THEN FLOOR(RAND() * 5) + 1 ELSE NULL END,
  CONCAT('Reason for transaction ', n),
  n,
  ELT((n % 3) + 1, 'Return','Exchange','Warranty'),
  NOW() - INTERVAL (n % 7) HOUR,
  ((n % 50) + 1),
  0
FROM seq;

-- populate AuditLog
INSERT INTO `mydb`.`AuditLog`
  (actionType, description, userId, `timestamp`)
SELECT
  ELT((n % 5) + 1, 'login','logout','add_stock','edit_stock','delete_stock'),
  CONCAT('Audit log entry ', n),
  ((n % 50) + 1),
  NOW() - INTERVAL (n % 24) HOUR
FROM seq;

-- restore checks
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;



SELECT * FROM AuditLog;
SELECT * FROM OrderInfo;
SELECT * FROM Orders;
SELECT * FROM Product;
SELECT * FROM ReturnExchange;
SELECT * FROM ReturnExchangeInfo;
SELECT * FROM StockEntry;
SELECT * FROM StockWithdrawal;
SELECT * FROM Users;