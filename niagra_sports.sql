-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Aug 10, 2015 at 09:25 PM
-- Server version: 5.5.44-0ubuntu0.14.04.1
-- PHP Version: 5.5.9-1ubuntu4.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `niagra_sports`
--

-- --------------------------------------------------------

--
-- Table structure for table `ACCOUNT`
--

CREATE TABLE IF NOT EXISTS `ACCOUNT` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `TITLE` varchar(30) NOT NULL,
  `CITY_ID` int(11) NOT NULL,
  `PTCL` varchar(15) DEFAULT NULL,
  `CELL` varchar(15) NOT NULL,
  `EXTRAS` varchar(100) DEFAULT NULL,
  `BALANCE` int(11) NOT NULL DEFAULT '0',
  `CREATED` date DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=10 ;

--
-- Dumping data for table `ACCOUNT`
--

INSERT INTO `ACCOUNT` (`ID`, `TITLE`, `CITY_ID`, `PTCL`, `CELL`, `EXTRAS`, `BALANCE`, `CREATED`) VALUES
(1, 'CA SPORTS', 2, '0524600759', '03335059809', 'Any extra detail', -10000, NULL),
(2, 'GIGA SPORTS', 4, '02134961463', '03213677789', 'Extra information', 98000, NULL),
(3, 'SOHAIL BOOK CENTER', 1, '0616561947', '03003234848', 'Gulshan Market', 12345, NULL),
(4, 'MULTAN KITAB GHAR', 1, '0614550786', '03128105123', '', -1000, NULL),
(5, 'MEHRAN SPORTS', 7, '', '03459001888', '', -2300, NULL),
(6, 'MADNI BOOK CENTER', 8, '', '03313697436', '', 1110, NULL),
(7, 'ALI SUPER STORE', 9, '', '03238257856', '', -3000, '2010-01-01'),
(8, 'GULSHAN SPORTS', 10, '', '03229641479', '', 6500, '0000-00-00'),
(9, 'IMRAN SPORTS', 11, '', '03238257856', '', 760, '0000-00-00');

-- --------------------------------------------------------

--
-- Table structure for table `BILL`
--

CREATE TABLE IF NOT EXISTS `BILL` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `B_DATE` datetime NOT NULL,
  `ACCOUNT_ID` int(11) NOT NULL,
  `AMOUNT_DUE` int(11) NOT NULL,
  `DISCOUNT` int(11) NOT NULL DEFAULT '0',
  `AMOUNT_PAID` int(11) NOT NULL,
  `USER_ID` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=9 ;

--
-- Dumping data for table `BILL`
--

INSERT INTO `BILL` (`ID`, `B_DATE`, `ACCOUNT_ID`, `AMOUNT_DUE`, `DISCOUNT`, `AMOUNT_PAID`, `USER_ID`) VALUES
(1, '2015-08-09 14:02:11', 1, 17100, 100, 17000, NULL),
(2, '2015-08-09 14:04:39', 6, 7000, 0, 7000, NULL),
(3, '2015-08-09 14:17:45', 6, 7000, 0, 7000, NULL),
(4, '2015-08-09 14:20:16', 6, 7000, 0, 7000, NULL),
(5, '2015-08-09 14:23:45', 6, 7000, 0, 7000, NULL),
(6, '2015-08-09 14:27:12', 3, 25020, 20, 25000, NULL),
(7, '2015-08-09 16:05:17', 8, 3500, 0, 3500, NULL),
(8, '2015-08-09 16:21:36', 9, 140, 0, 140, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `CATEGORY`
--

CREATE TABLE IF NOT EXISTS `CATEGORY` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `NAME` varchar(20) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=10 ;

--
-- Dumping data for table `CATEGORY`
--

INSERT INTO `CATEGORY` (`ID`, `NAME`) VALUES
(1, 'TAPE'),
(2, 'BALL'),
(6, 'BAT'),
(7, 'CARD'),
(9, 'BADMINTON');

-- --------------------------------------------------------

--
-- Table structure for table `CITY`
--

CREATE TABLE IF NOT EXISTS `CITY` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `NAME` varchar(30) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=12 ;

--
-- Dumping data for table `CITY`
--

INSERT INTO `CITY` (`ID`, `NAME`) VALUES
(1, 'MULTAN'),
(2, 'SIALKOT'),
(3, 'LAHORE'),
(4, 'KARACHI'),
(5, 'HYDERABAD'),
(6, 'ISLAMABAD'),
(7, 'KHIPRO'),
(8, 'SARGODHA'),
(9, 'KHANEWAL'),
(10, 'BAHAWALPUR'),
(11, 'SAHIWAL');

-- --------------------------------------------------------

--
-- Table structure for table `ITEM`
--

CREATE TABLE IF NOT EXISTS `ITEM` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `NAME` varchar(30) NOT NULL,
  `CATEGORY_ID` int(11) NOT NULL,
  `PRICE` int(11) NOT NULL,
  `STOCK` int(11) DEFAULT NULL,
  `USER_ID` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=8 ;

--
-- Dumping data for table `ITEM`
--

INSERT INTO `ITEM` (`ID`, `NAME`, `CATEGORY_ID`, `PRICE`, `STOCK`, `USER_ID`) VALUES
(2, 'CA GOLD', 2, 1280, 1000, 1),
(3, 'CA 12000', 6, 20000, 7, 1),
(4, 'OSAKA', 1, 100, 50, 1),
(5, 'ROYAL CARDS', 7, 140, 100, 0),
(7, 'YONEX 1852', 9, 3500, 30, 1);

-- --------------------------------------------------------

--
-- Table structure for table `PRIVILEGE`
--

CREATE TABLE IF NOT EXISTS `PRIVILEGE` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `TITLE` varchar(20) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `PRIVILEGE`
--

INSERT INTO `PRIVILEGE` (`ID`, `TITLE`) VALUES
(1, 'Admin'),
(2, 'Worker');

-- --------------------------------------------------------

--
-- Table structure for table `RETURN_IN`
--

CREATE TABLE IF NOT EXISTS `RETURN_IN` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `DATE` datetime NOT NULL,
  `ACCOUNT_ID` int(11) NOT NULL,
  `BILL_ID` int(11) NOT NULL,
  `USER_ID` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `RETURN_ITEM`
--

CREATE TABLE IF NOT EXISTS `RETURN_ITEM` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `RETURN_ID` int(11) NOT NULL,
  `SALE_ID` int(11) NOT NULL,
  `QUANTITY` int(11) NOT NULL,
  `PRICE` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `RETURN_OUT`
--

CREATE TABLE IF NOT EXISTS `RETURN_OUT` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `DATE` datetime NOT NULL,
  `ACCOUNT_ID` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `RETURN_STOCK`
--

CREATE TABLE IF NOT EXISTS `RETURN_STOCK` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `RETURN_ID` int(11) NOT NULL,
  `ITEM_ID` int(11) NOT NULL,
  `COST` int(11) NOT NULL,
  `QUANTITY` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `SALE`
--

CREATE TABLE IF NOT EXISTS `SALE` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ITEM_ID` int(11) NOT NULL,
  `COST` int(11) NOT NULL,
  `QUANTITY` int(11) NOT NULL,
  `BILL_ID` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=12 ;

--
-- Dumping data for table `SALE`
--

INSERT INTO `SALE` (`ID`, `ITEM_ID`, `COST`, `QUANTITY`, `BILL_ID`) VALUES
(1, 2, 1200, 5, 3),
(2, 2, 1200, 5, 4),
(3, 2, 1200, 5, 5),
(4, 4, 100, 10, 5),
(5, 3, 20000, 1, 6),
(6, 2, 1280, 1, 6),
(7, 4, 100, 1, 6),
(8, 5, 140, 1, 6),
(9, 7, 3500, 1, 6),
(10, 7, 3500, 1, 7),
(11, 5, 140, 1, 8);

-- --------------------------------------------------------

--
-- Table structure for table `TRANSACTION`
--

CREATE TABLE IF NOT EXISTS `TRANSACTION` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `T_DATE` datetime NOT NULL,
  `AMOUNT` int(11) NOT NULL,
  `DESCRIPTION` varchar(100) NOT NULL,
  `ACCOUNT_ID` int(11) NOT NULL,
  `USER_ID` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=19 ;

--
-- Dumping data for table `TRANSACTION`
--

INSERT INTO `TRANSACTION` (`ID`, `T_DATE`, `AMOUNT`, `DESCRIPTION`, `ACCOUNT_ID`, `USER_ID`) VALUES
(1, '2015-07-01 00:00:00', 1000, 'Test transaction 1', 5, NULL),
(2, '2015-07-16 00:00:00', -500, 'Test transaction 2', 3, NULL),
(3, '2015-07-31 00:00:00', 15000, 'Test transaction 3', 4, NULL),
(4, '2015-08-01 00:00:00', -4000, 'test transaction 4', 1, NULL),
(5, '2015-08-02 00:00:00', 1234, 'test transaction 6', 9, NULL),
(6, '2015-08-07 23:31:43', -1000, 'Testing transaction from app', 2, NULL),
(7, '2015-08-09 17:53:31', 140, 'Paid in Cash', 9, NULL),
(8, '2015-08-09 17:53:31', 140, 'Bill No. 8', 9, NULL),
(9, '2015-08-09 17:53:31', 140, 'Paid in Cash', 9, NULL),
(10, '2015-08-09 17:53:31', 130, 'Bill No. 8', 9, NULL),
(11, '2015-08-09 17:57:18', 140, 'Paid in Cash', 9, NULL),
(12, '2015-08-09 17:57:18', -130, 'Bill No. 8', 9, NULL),
(13, '2015-08-09 18:13:49', 140, 'Bill No. 8', 9, NULL),
(14, '2015-08-09 18:13:49', -130, 'Paid in Cash', 9, NULL),
(15, '2015-08-09 18:13:49', 700, 'Bill no. X', 7, NULL),
(16, '2015-08-09 18:13:49', -1000, 'Paid via UBL', 4, NULL),
(17, '2015-08-10 13:46:13', 140, 'Bill No. 8', 9, NULL),
(18, '2015-08-10 13:46:13', -130, 'Paid in Cash', 9, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `USER`
--

CREATE TABLE IF NOT EXISTS `USER` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `FIRST_NAME` varchar(30) NOT NULL,
  `LAST_NAME` varchar(30) NOT NULL,
  `USER_NAME` varchar(20) NOT NULL,
  `PASSWORD` varchar(20) NOT NULL,
  `USER_TYPE` int(11) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `USER`
--

INSERT INTO `USER` (`ID`, `FIRST_NAME`, `LAST_NAME`, `USER_NAME`, `PASSWORD`, `USER_TYPE`) VALUES
(1, 'Uzair', 'Ghauri', 'uzair', 'lionking', 1);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
