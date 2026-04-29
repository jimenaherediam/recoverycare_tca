-- Sección de configuración inicial
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- ========== TABLA: profesional (CORREGIDA) ==========
CREATE TABLE IF NOT EXISTS `profesional` (
  `id_profesional` int(11) NOT NULL PRIMARY KEY,
  `especialidad` ENUM('PSIQUIATRA', 'PSICÓLOGO', 'NUTRICIONISTA', '') DEFAULT NULL,
  `codigo_profesional` varchar(50) UNIQUE DEFAULT NULL,
  FOREIGN KEY (`id_profesional`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========== TABLA: usuario ==========
CREATE TABLE IF NOT EXISTS `usuario` (
  `id_usuario` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(100) UNIQUE DEFAULT NULL,
  `dni` VARCHAR(20) UNIQUE DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `tipo` ENUM('PACIENTE','PROFESIONAL','ADMIN','VOLUNTARIO') DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========== TABLA: paciente ==========
CREATE TABLE IF NOT EXISTS `paciente` (
  `id_paciente` int(11) NOT NULL PRIMARY KEY,
  `edad` int(11) DEFAULT NULL,
  `fecha_diagnostico` date DEFAULT NULL,
  `estancia_hospitalaria` tinyint(1) NOT NULL DEFAULT 0,
  `localidad` ENUM('GALICIA','ASTURIAS','CANTABRIA','PAIS VASCO','NAVARRA','ARAGÓN','CATALUÑA','CASTILLA Y LEÓN','LA RIOJA','COMUNIDAD VALENCIANA','MADRID','EXTREMADURA','CASTILLA LA MANCHA','MURCIA','ANDALUCÍA','ISLAS BALEARES','ISLAS CANARIAS','CEUTA','MELILLA') DEFAULT NULL,
  `codigo_profesional` varchar(50) DEFAULT NULL,
  FOREIGN KEY (`id_paciente`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========== TABLA: paciente_profesional ==========
CREATE TABLE IF NOT EXISTS `paciente_profesional` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `profesional_id` int(11) NOT NULL,
  `paciente_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `paciente_pac_prof` (`paciente_id`),
  KEY `profesional_pac_prof` (`profesional_id`),
  CONSTRAINT `paciente_pac_prof` FOREIGN KEY (`paciente_id`) REFERENCES `paciente` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `profesional_pac_prof` FOREIGN KEY (`profesional_id`) REFERENCES `profesional` (`id_profesional`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========== TABLA: cita ==========
CREATE TABLE IF NOT EXISTS `cita` (
  `id_cita` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` datetime DEFAULT NULL,
  `motivo` VARCHAR(255) DEFAULT NULL,
  `id_paciente` int(11) DEFAULT NULL,
  `id_profesional` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_cita`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_profesional` (`id_profesional`),
  CONSTRAINT `cita_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`),
  CONSTRAINT `cita_ibfk_2` FOREIGN KEY (`id_profesional`) REFERENCES `profesional` (`id_profesional`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========== TABLA: comida ==========
CREATE TABLE IF NOT EXISTS `comida` (
  `id_comida` INT(11) NOT NULL AUTO_INCREMENT,
  `menu_descripcion` VARCHAR(255),
  `acompanado` BOOLEAN,
  `paciente_id` INT(11),
  `fecha` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_comida`),
  CONSTRAINT `paciente_comida` FOREIGN KEY (`paciente_id`) REFERENCES `paciente` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========== TABLA: cuestionario ==========
CREATE TABLE IF NOT EXISTS `cuestionario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `comida_id` int(11) NOT NULL,
  `autor` ENUM('PACIENTE','ACOMPAÑANTE','','') NOT NULL,
  `preguntas_respuestas` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cuest_comida` (`comida_id`),
  CONSTRAINT `cuest_comida` FOREIGN KEY (`comida_id`) REFERENCES `comida` (`id_comida`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========== TABLA: analisisia ==========
CREATE TABLE IF NOT EXISTS `analisisia` (
  `id_analisis` int(11) NOT NULL AUTO_INCREMENT,
  `resultado` text DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `nivel_ansiedad` float NOT NULL,
  `cantidad_ingerida` varchar(50) NOT NULL,
  `tipo_ingesta` ENUM('DESAYUNO','COMIDA','CENA','OTRO') NOT NULL,
  `camara_oculta` tinyint(1) NOT NULL,
  `desconexion_camara` tinyint(1) NOT NULL,
  `conversacion_sensible` tinyint(1) NOT NULL,
  `id_comida` int(11) NOT NULL,
  `id_chat` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_analisis`),
  KEY `analisisia_ibfk_1` (`id_chat`),
  KEY `analisisia_ibfk_2` (`id_comida`),
  CONSTRAINT `analisisia_ibfk_1` FOREIGN KEY (`id_chat`) REFERENCES `chatbot` (`id_chatbot`),
  CONSTRAINT `analisisia_ibfk_2` FOREIGN KEY (`id_comida`) REFERENCES `comida` (`id_comida`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========== TABLA: chatbot ==========
CREATE TABLE IF NOT EXISTS `chatbot` (
  `id_chatbot` INT(11) NOT NULL AUTO_INCREMENT,
  `id_paciente` INT(11) NOT NULL,
  `role` VARCHAR(20) NOT NULL,
  `mensaje` TEXT NOT NULL,
  `fecha` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_chatbot`),
  KEY `id_paciente` (`id_paciente`),
  CONSTRAINT `chatbot_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========== TABLA: alerta ==========
CREATE TABLE IF NOT EXISTS `alerta` (
  `id_alerta` INT(11) NOT NULL AUTO_INCREMENT,
  `id_analisis` INT(11) DEFAULT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `nivel` VARCHAR(50) DEFAULT NULL,
  `fecha` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `tipo_alerta` VARCHAR(50) NOT NULL,
  `revisada` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_alerta`),
  KEY `alerta_ibfk_1` (`id_analisis`),
  CONSTRAINT `alerta_ibfk_1` FOREIGN KEY (`id_analisis`) REFERENCES `analisisia` (`id_analisis`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========== TABLA: contenidoeducativo ==========
CREATE TABLE IF NOT EXISTS `contenidoeducativo` (
  `id_contenido` int(11) NOT NULL,
  `titulo` varchar(100) DEFAULT NULL,
  `tipo` ENUM('VIDEO','JUEGO') DEFAULT NULL,
  PRIMARY KEY (`id_contenido`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========== TABLA: video ==========
CREATE TABLE IF NOT EXISTS `video` (
  `id_video` int(11) NOT NULL,
  `url` text DEFAULT NULL,
  PRIMARY KEY (`id_video`),
  CONSTRAINT `video_ibfk_1` FOREIGN KEY (`id_video`) REFERENCES `contenidoeducativo` (`id_contenido`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========== TABLA: juego ==========
CREATE TABLE IF NOT EXISTS `juego` (
  `id_juego` int(11) NOT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id_juego`),
  CONSTRAINT `juego_ibfk_1` FOREIGN KEY (`id_juego`) REFERENCES `contenidoeducativo` (`id_contenido`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========== TABLA: planpersonalizado ==========
CREATE TABLE IF NOT EXISTS `planpersonalizado` (
  `id_plan` int(11) NOT NULL,
  `id_paciente` int(11) DEFAULT NULL,
  `id_profesional` int(11) DEFAULT NULL,
  `tipo` ENUM('MENU','MEDICAMENTOS','EJERCICIOS','OTROS') NOT NULL,
  `descripcion` text DEFAULT NULL,
  `contenido` text NOT NULL,
  PRIMARY KEY (`id_plan`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_profesional` (`id_profesional`),
  CONSTRAINT `planpersonalizado_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`),
  CONSTRAINT `planpersonalizado_ibfk_2` FOREIGN KEY (`id_profesional`) REFERENCES `profesional` (`id_profesional`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========== TABLA: evolucionreport ==========
CREATE TABLE IF NOT EXISTS `evolucionreport` (
  `id_reporte` int(11) NOT NULL,
  `id_paciente` int(11) DEFAULT NULL,
  `tipo_tca` text DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `imc` float NOT NULL,
  `tasa_cumplimiento` float NOT NULL,
  `ansiedad` float NOT NULL,
  PRIMARY KEY (`id_reporte`),
  KEY `id_paciente` (`id_paciente`),
  CONSTRAINT `evolucionreport_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========== TABLA: voluntario ==========
CREATE TABLE IF NOT EXISTS `voluntario` (
  `id_voluntario` int(11) NOT NULL,
  `localidad` ENUM('GALICIA','ASTURIAS','CANTABRIA','PAIS VASCO','NAVARRA','ARAGÓN','CATALUÑA','CASTILLA Y LEÓN','LA RIOJA','MADRID','COMUNIDAD VALENCIANA','EXTREMADURA','CASTILLA LA MANCHA','MURCIA','ANDALUCIA','ISLAS BALEARES','ISLAS CANARIAS','CEUTA','MELILLA') NOT NULL,
  `telefono` int(9) NOT NULL,
  PRIMARY KEY (`id_voluntario`),
  CONSTRAINT `voluntario_ibfk_1` FOREIGN KEY (`id_voluntario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========== AUTO_INCREMENT ==========
ALTER TABLE `usuario` AUTO_INCREMENT = 1;
ALTER TABLE `alerta` AUTO_INCREMENT = 1;
ALTER TABLE `analisisia` AUTO_INCREMENT = 1;
ALTER TABLE `chatbot` AUTO_INCREMENT = 1;
ALTER TABLE `cita` AUTO_INCREMENT = 1;
ALTER TABLE `comida` AUTO_INCREMENT = 1;
ALTER TABLE `cuestionario` AUTO_INCREMENT = 1;
ALTER TABLE `paciente_profesional` AUTO_INCREMENT = 1;
ALTER TABLE `planpersonalizado` AUTO_INCREMENT = 1;

COMMIT;