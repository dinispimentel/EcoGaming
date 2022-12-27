CREATE DATABASE  IF NOT EXISTS `ecogaming` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `ecogaming`;
-- MySQL dump 10.13  Distrib 8.0.31, for Linux (x86_64)
--
-- Host: localhost    Database: ecogaming
-- ------------------------------------------------------
-- Server version	8.0.31-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `flash_user_config`
--

DROP TABLE IF EXISTS `flash_user_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flash_user_config` (
  `uid` int NOT NULL,
  `update_internal_dmarket` json DEFAULT NULL,
  `retrieve_best_deals_dmarket` json DEFAULT NULL,
  `retrieve_best_deals_g2gsdb` json DEFAULT NULL,
  PRIMARY KEY (`uid`),
  CONSTRAINT `uid_flash_config` FOREIGN KEY (`uid`) REFERENCES `logins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flash_user_config`
--

LOCK TABLES `flash_user_config` WRITE;
/*!40000 ALTER TABLE `flash_user_config` DISABLE KEYS */;
INSERT INTO `flash_user_config` VALUES (1,'{\"limit\": 100, \"types\": \"p2p\", \"gameId\": \"a8db\", \"offset\": 0, \"orderBy\": \"best_discount\", \"priceTo\": 400, \"currency\": \"USD\", \"maxLimit\": 500, \"orderDir\": \"desc\", \"priceFrom\": 1}','{\"offset\": 0, \"sort_type\": \"InstantPriceGapRatio\", \"offer_count\": 500, \"sort_direction\": 1}','{\"offset\": 0, \"sort_type\": \"priceGapPercentage\", \"offer_count\": 146, \"sort_direction\": 1}');
/*!40000 ALTER TABLE `flash_user_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logins`
--

DROP TABLE IF EXISTS `logins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(16) NOT NULL,
  `password` tinytext NOT NULL,
  `avatar` tinytext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logins`
--

LOCK TABLES `logins` WRITE;
/*!40000 ALTER TABLE `logins` DISABLE KEYS */;
INSERT INTO `logins` VALUES (1,'admin','$2b$10$wl/RvaFgSrdhn8Lza7ulGuayGKvqWUq4kBN7WysL1IePFPDJ7qoCW','https://www.freeiconspng.com/thumbs/discord-icon/discord-icon-7.png'),(2,'user','$2b$10$5y18RNwF/uAANQCbW0IFYOJO4dDII5oopARPZWh123jrPGEVvMeZq',NULL);
/*!40000 ALTER TABLE `logins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scraper_config`
--

DROP TABLE IF EXISTS `scraper_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scraper_config` (
  `id` int NOT NULL,
  `host` varchar(64) NOT NULL DEFAULT '192.168.0.120',
  `wsport` int NOT NULL DEFAULT '4000',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  CONSTRAINT `uid` FOREIGN KEY (`id`) REFERENCES `logins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scraper_config`
--

LOCK TABLES `scraper_config` WRITE;
/*!40000 ALTER TABLE `scraper_config` DISABLE KEYS */;
INSERT INTO `scraper_config` VALUES (1,'192.168.0.120',4000);
/*!40000 ALTER TABLE `scraper_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `uid` int NOT NULL,
  `general-settings` json DEFAULT NULL,
  `dmsm-settings` json DEFAULT NULL,
  `g2gsdb-settings` json DEFAULT NULL,
  `exrates-settings` json DEFAULT NULL,
  PRIMARY KEY (`uid`),
  CONSTRAINT `fk_settings_uid` FOREIGN KEY (`uid`) REFERENCES `logins` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'ecogaming'
--

--
-- Dumping routines for database 'ecogaming'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-12-27 18:50:29
