USE `test` ;
INSERT INTO Users (fullName, userRole, username, userPassword, pathName, dateAdded, lastEditedDate, lastEditedUser, deleteFlag)
VALUES
('Ching Wong Man', 'admin', 'PaddleMan365', 'WompWomp', NULL, '2024-01-01', '2025-07-28 05:00:51', 1, 0),
('Andrei Balingit', 'admin', 'a', '$argon2id$v=19$m=65536,t=3,p=4$Oha6/X9Y9tM3MpmQXIbYSw$pZLEUUS4lX6klW1Sjxch8bfjKfrsufQpTBpU4dQ5H1w', NULL, '2024-01-01', '2025-07-22 05:00:51', 1, 0),
('System Admin','admin', 'admin', '$argon2id$v=19$m=65536,t=3,p=4$Ejx0AEu/AJ/1Brpuh0ZWCQ$J+cJ35IQjncNHk/QixVA0urdW5k1MnYIFcDwiGbANa8', NULL, '2025-07-21', '2025-07-21 23:47:08', 0, 0),
('Libro James', 'manager', 'LBJ', 'WowWowWee', NULL, '2024-01-01', '2025-07-22 05:00:51', 1, 0),
('Larry Legend', 'staff', 'BirdMan', 'MuscleMan', NULL, '2024-07-01', '2025-05-27 05:00:51', 1, 0),
('Justin Beaver', 'staff', 'PopstarB', 'Hatdog', NULL, '2024-07-01', '2025-05-28 05:00:51', 1, 0);

SELECT * FROM `test`.`Users`;