-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3304
-- Tiempo de generación: 15-04-2026 a las 20:34:44
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `recoverycare`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alerta`
--

CREATE TABLE `alerta` (
  `id_alerta` INT(11) NOT NULL AUTO_INCREMENT,  
  `id_analisis` INT(11) DEFAULT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `nivel` VARCHAR(50) DEFAULT NULL,
  `fecha` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `tipo_alerta` VARCHAR(50) NOT NULL,
  `revisada` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_alerta`)                   
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `analisisia`
--

CREATE TABLE `analisisia` (
  `id_analisis` int(11) NOT NULL AUTO_INCREMENT,
  `resultado` text DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `nivel_ansiedad` float NOT NULL,              
  `cantidad_ingerida` varchar(50) NOT NULL,
  `tipo_ingesta` enum('DESAYUNO','COMIDA','CENA','OTRO') NOT NULL,
  `camara_oculta` tinyint(1) NOT NULL,
  `desconexion_camara` tinyint(1) NOT NULL,
  `conversacion_sensible` tinyint(1) NOT NULL,
  `id_comida` int(11) NOT NULL,
  `id_chat` int(11) DEFAULT NULL,                  
  PRIMARY KEY (`id_analisis`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `chatbot`
--

CREATE TABLE `chatbot` (
`id_chatbot` INT(11) NOT NULL AUTO_INCREMENT,
  `id_paciente` INT(11) NOT NULL,
  `role` VARCHAR(20) NOT NULL,       
  `mensaje` TEXT NOT NULL,
  `fecha` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_chatbot`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cita`
--

CREATE TABLE `cita` (
  `id_cita` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` datetime DEFAULT NULL,
  `motivo` VARCHAR(255) DEFAULT NULL,
  `id_paciente` int(11) DEFAULT NULL,
  `id_profesional` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_cita`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comida`
--

CREATE TABLE `comida` (
  `id_comida` INT(11) NOT NULL AUTO_INCREMENT,
  `menu_descripcion` VARCHAR(255),
  `acompanado` BOOLEAN,
  `paciente_id` INT(11),
  `fecha` DATETIME DEFAULT CURRENT_TIMESTAMP, -- ¡AÑADE ESTA LÍNEA!
  PRIMARY KEY (`id_comida`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contenidoeducativo`
--

CREATE TABLE `contenidoeducativo` (
  `id_contenido` int(11) NOT NULL,
  `titulo` varchar(100) DEFAULT NULL,
  `tipo` enum('VIDEO','JUEGO') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuestionario`
--

CREATE TABLE `cuestionario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `comida_id` int(11) NOT NULL,
  `autor` enum('PACIENTE','ACOMPAÑANTE','','') NOT NULL,
  `preguntas_respuestas` TEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evolucionreport`
--

CREATE TABLE `evolucionreport` (
  `id_reporte` int(11) NOT NULL,
  `id_paciente` int(11) DEFAULT NULL,
  `tipo_tca` text DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `imc` float NOT NULL,
  `tasa_cumplimiento` float NOT NULL,
  `ansiedad` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `juego`
--

CREATE TABLE `juego` (
  `id_juego` int(11) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paciente`
--
"""
CREATE TABLE `paciente` (
  `id_paciente` int(11) NOT NULL,
  `edad` int(11) DEFAULT NULL,
  `nombre` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `fecha_diagnostico` date NOT NULL,
  `estancia_hospitalaria` tinyint(1) NOT NULL,
  `localidad` enum('GALICIA','ASTURIAS','CANTABRIA','PAIS VASCO','NAVARRA','ARAGÓN','CATALUÑA','CASTILLA Y LEÓN','LA RIOJA','COMUNIDAD VALENCIANA','MADRID','EXTREMADURA','CASTILLA LA MANCHA','MURCIA','ANDALUCÍA','ISLAS BALEARES','ISLAS CANARIAS','CEUTA','MELILLA') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
"""
CREATE TABLE `paciente` (
  `id_paciente` int(11) NOT NULL,
  `edad` int(11) DEFAULT NULL,
  `nombre` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `fecha_diagnostico` date DEFAULT NULL,           
  `estancia_hospitalaria` tinyint(1) NOT NULL DEFAULT 0,
  `localidad` enum('GALICIA','ASTURIAS','CANTABRIA','PAIS VASCO','NAVARRA','ARAGÓN','CATALUÑA','CASTILLA Y LEÓN','LA RIOJA','COMUNIDAD VALENCIANA','MADRID','EXTREMADURA','CASTILLA LA MANCHA','MURCIA','ANDALUCÍA','ISLAS BALEARES','ISLAS CANARIAS','CEUTA','MELILLA') DEFAULT NULL,
  `codigo_profesional` varchar(50) DEFAULT NULL,  
  PRIMARY KEY (`id_paciente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paciente_profesional`
--

CREATE TABLE `paciente_profesional` (
  `id` int(11) NOT NULL,
  `profesional_id` int(11) NOT NULL,
  `paciente_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `planpersonalizado`
--

CREATE TABLE `planpersonalizado` (
  `id_plan` int(11) NOT NULL,
  `id_paciente` int(11) DEFAULT NULL,
  `id_profesional` int(11) DEFAULT NULL,
  `tipo` enum('MENU','MEDICAMENTOS','EJERCICIOS','OTORS') NOT NULL,
  `descripcion` text DEFAULT NULL,
  `contenido` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `profesional`
--

CREATE TABLE `profesional` (
  `id_profesional` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `especialidad` enum('PSQUIATRA','PSICÓLOGO','NUTRICIONISTA','') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--
"""
CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `tipo` enum('PACIENTE','PROFESIONAL','ADMIN','VOLUNTARIO') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
"""
CREATE TABLE `usuario` (
  `id_usuario` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `dni` VARCHAR(20) UNIQUE DEFAULT NULL,        
  `password` VARCHAR(255) DEFAULT NULL,
  `tipo` ENUM('PACIENTE','PROFESIONAL','ADMIN','VOLUNTARIO') DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP, 
  PRIMARY KEY (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `video`
--

CREATE TABLE `video` (
  `id_video` int(11) NOT NULL,
  `url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `voluntario`
--

CREATE TABLE `voluntario` (
  `id_voluntario` int(11) NOT NULL,
  `localidad` enum('GALICIA','ASTURIAS','CANTABRIA','PAIS VASCO','NAVARRA','ARAGÓN','CATALUÑA','CASTILLA Y LEÓN','LA RIOJA','MADRID','COMUNIDAD VALENCIANA','EXTREMADURA','CASTILLA LA MANCHA','MURCIA','ANDALUCIA','ISLAS BALEARES','ISLAS CANARIAS','CEUTA','MELILLA') NOT NULL,
  `telefono` int(9) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alerta`
--
ALTER TABLE `alerta`
  ADD PRIMARY KEY (`id_alerta`),
  ADD KEY `alerta_ibfk_1` (`id_analisis`);

--
-- Indices de la tabla `analisisia`
--
ALTER TABLE `analisisia`
  ADD PRIMARY KEY (`id_analisis`),
  ADD KEY `analisisia_ibfk_1` (`id_chat`),
  ADD KEY `analisisia_ibfk_2` (`id_comida`);

--
-- Indices de la tabla `chatbot`
--
ALTER TABLE `chatbot`
  ADD PRIMARY KEY (`id_chatbot`),
  ADD KEY `id_paciente` (`id_paciente`);

--
-- Indices de la tabla `cita`
--
ALTER TABLE `cita`
  ADD PRIMARY KEY (`id_cita`),
  ADD KEY `id_paciente` (`id_paciente`),
  ADD KEY `id_profesional` (`id_profesional`);

--
-- Indices de la tabla `comida`
--
ALTER TABLE `comida`
  ADD PRIMARY KEY (`id_comida`);

--
-- Indices de la tabla `contenidoeducativo`
--
ALTER TABLE `contenidoeducativo`
  ADD PRIMARY KEY (`id_contenido`);

--
-- Indices de la tabla `cuestionario`
--
ALTER TABLE `cuestionario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cuest_comida` (`comida_id`);

--
-- Indices de la tabla `evolucionreport`
--
ALTER TABLE `evolucionreport`
  ADD PRIMARY KEY (`id_reporte`),
  ADD KEY `id_paciente` (`id_paciente`);

--
-- Indices de la tabla `juego`
--
ALTER TABLE `juego`
  ADD PRIMARY KEY (`id_juego`);

--
-- Indices de la tabla `paciente`
--
ALTER TABLE `paciente`
  ADD PRIMARY KEY (`id_paciente`);

--
-- Indices de la tabla `paciente_profesional`
--
ALTER TABLE `paciente_profesional`
  ADD PRIMARY KEY (`id`),
  ADD KEY `paciente_pac_prof` (`paciente_id`),
  ADD KEY `profesional_pac_prof` (`profesional_id`);

--
-- Indices de la tabla `planpersonalizado`
--
ALTER TABLE `planpersonalizado`
  ADD PRIMARY KEY (`id_plan`),
  ADD KEY `id_paciente` (`id_paciente`),
  ADD KEY `id_profesional` (`id_profesional`);

--
-- Indices de la tabla `profesional`
--
ALTER TABLE `profesional`
  ADD PRIMARY KEY (`id_profesional`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `video`
--
ALTER TABLE `video`
  ADD PRIMARY KEY (`id_video`);

--
-- Indices de la tabla `voluntario`
--
ALTER TABLE `voluntario`
  ADD PRIMARY KEY (`id_voluntario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alerta`
--
ALTER TABLE `alerta`
  MODIFY `id_alerta` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `analisisia`
--
ALTER TABLE `analisisia`
  MODIFY `id_analisis` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `chatbot`
--
ALTER TABLE `chatbot`
  MODIFY `id_chatbot` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cita`
--
ALTER TABLE `cita`
  MODIFY `id_cita` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `comida`
--
ALTER TABLE `comida`
  MODIFY `id_comida` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `contenidoeducativo`
--
ALTER TABLE `contenidoeducativo`
  MODIFY `id_contenido` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cuestionario`
--
ALTER TABLE `cuestionario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `evolucionreport`
--
ALTER TABLE `evolucionreport`
  MODIFY `id_reporte` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `paciente_profesional`
--
ALTER TABLE `paciente_profesional`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `planpersonalizado`
--
ALTER TABLE `planpersonalizado`
  MODIFY `id_plan` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `alerta`
--
ALTER TABLE `alerta`
  ADD CONSTRAINT `alerta_ibfk_1` FOREIGN KEY (`id_analisis`) REFERENCES `analisisia` (`id_analisis`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `analisisia`
--
ALTER TABLE `analisisia`
  ADD CONSTRAINT `analisisia_ibfk_1` FOREIGN KEY (`id_chat`) REFERENCES `chatbot` (`id_chatbot`),
  ADD CONSTRAINT `analisisia_ibfk_2` FOREIGN KEY (`id_comida`) REFERENCES `comida` (`id_comida`);

--
-- Filtros para la tabla `chatbot`
--
ALTER TABLE `chatbot`
  ADD CONSTRAINT `chatbot_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cita`
--
ALTER TABLE `cita`
  ADD CONSTRAINT `cita_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`),
  ADD CONSTRAINT `cita_ibfk_2` FOREIGN KEY (`id_profesional`) REFERENCES `profesional` (`id_profesional`);

--
-- Filtros para la tabla `comida`
--
ALTER TABLE `comida`
  ADD CONSTRAINT `paciente_comida` FOREIGN KEY (`paciente_id`) REFERENCES `paciente` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `cuestionario`
--
ALTER TABLE `cuestionario`
  ADD CONSTRAINT `cuest_comida` FOREIGN KEY (`comida_id`) REFERENCES `comida` (`id_comida`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `evolucionreport`
--
ALTER TABLE `evolucionreport`
  ADD CONSTRAINT `evolucionreport_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`);

--
-- Filtros para la tabla `juego`
--
ALTER TABLE `juego`
  ADD CONSTRAINT `juego_ibfk_1` FOREIGN KEY (`id_juego`) REFERENCES `contenidoeducativo` (`id_contenido`) ON DELETE CASCADE;

--
-- Filtros para la tabla `paciente`
--
ALTER TABLE `paciente`
  ADD CONSTRAINT `paciente_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `paciente_profesional`
--
ALTER TABLE `paciente_profesional`
  ADD CONSTRAINT `paciente_pac_prof` FOREIGN KEY (`paciente_id`) REFERENCES `paciente` (`id_paciente`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `profesional_pac_prof` FOREIGN KEY (`profesional_id`) REFERENCES `profesional` (`id_profesional`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `planpersonalizado`
--
ALTER TABLE `planpersonalizado`
  ADD CONSTRAINT `planpersonalizado_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`),
  ADD CONSTRAINT `planpersonalizado_ibfk_2` FOREIGN KEY (`id_profesional`) REFERENCES `profesional` (`id_profesional`);

--
-- Filtros para la tabla `profesional`
--
ALTER TABLE `profesional`
  ADD CONSTRAINT `profesional_ibfk_1` FOREIGN KEY (`id_profesional`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `video`
--
ALTER TABLE `video`
  ADD CONSTRAINT `video_ibfk_1` FOREIGN KEY (`id_video`) REFERENCES `contenidoeducativo` (`id_contenido`) ON DELETE CASCADE;

--
-- Filtros para la tabla `voluntario`
--
ALTER TABLE `voluntario`
  ADD CONSTRAINT `voluntario_ibfk_1` FOREIGN KEY (`id_voluntario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
