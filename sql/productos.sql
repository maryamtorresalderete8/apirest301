CREATE TABLE `productos` (
  `pk_clave_pro` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `fk_clave_cat` int NOT NULL,
  PRIMARY KEY (`pk_clave_pro`),
  KEY `fk_clave_cat` (`fk_clave_cat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
