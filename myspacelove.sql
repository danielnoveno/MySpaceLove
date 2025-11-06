-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 07, 2025 at 12:03 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `myspacelove`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `countdowns`
--

CREATE TABLE `countdowns` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `space_id` bigint(20) UNSIGNED NOT NULL,
  `event_name` varchar(255) NOT NULL,
  `event_date` date NOT NULL,
  `description` text DEFAULT NULL,
  `activities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`activities`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `daily_messages`
--

CREATE TABLE `daily_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `space_id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `message` text NOT NULL,
  `generated_by` enum('ai','manual') NOT NULL DEFAULT 'ai',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `docs`
--

CREATE TABLE `docs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `space_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `listening_plans`
--

CREATE TABLE `listening_plans` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `space_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `spotify_playlist_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `love_journals`
--

CREATE TABLE `love_journals` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `space_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `mood` enum('happy','sad','miss','excited','grateful') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `love_timelines`
--

CREATE TABLE `love_timelines` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `space_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `date` date NOT NULL,
  `media_paths` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`media_paths`)),
  `thumbnail_path` varchar(255) DEFAULT NULL,
  `media_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `media_galleries`
--

CREATE TABLE `media_galleries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `space_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `collection_key` char(36) DEFAULT NULL,
  `collection_index` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `title` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `memory_lane_configs`
--

CREATE TABLE `memory_lane_configs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `space_id` bigint(20) UNSIGNED NOT NULL,
  `level_one_image` varchar(255) DEFAULT NULL,
  `level_two_image` varchar(255) DEFAULT NULL,
  `level_three_image` varchar(255) DEFAULT NULL,
  `level_one_title` varchar(255) DEFAULT NULL,
  `level_one_body` text DEFAULT NULL,
  `level_two_title` varchar(255) DEFAULT NULL,
  `level_two_body` text DEFAULT NULL,
  `level_three_title` varchar(255) DEFAULT NULL,
  `level_three_body` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_09_23_000007_create_themes_table', 1),
(5, '2025_09_23_000008_create_spaces_table', 1),
(6, '2025_09_23_043505_create_daily_messages_table', 1),
(7, '2025_09_23_043609_create_timelines_table', 1),
(8, '2025_09_23_043807_create_countdowns_table', 1),
(9, '2025_09_23_043822_create_love_journals_table', 1),
(10, '2025_09_23_043840_create_surprise_notes_table', 1),
(11, '2025_09_23_043857_create_media_galleries_table', 1),
(12, '2025_09_23_063218_create_love_timelines_table', 1),
(13, '2025_09_23_063428_create_wishlist_items_table', 1),
(14, '2025_09_23_063554_create_docs_table', 1),
(15, '2025_09_30_074412_add_image_to_countdowns_table', 1),
(16, '2025_10_14_043140_add_media_paths_to_love_timelines_table', 1),
(17, '2025_10_20_150600_create_spotify_tokens_table', 1),
(18, '2025_10_20_150700_create_spotify_surprise_drops_table', 1),
(19, '2025_10_20_150800_create_spotify_capsules_table', 1),
(20, '2025_10_27_030459_add_google_auth_columns_to_users_table', 1),
(21, '2025_10_27_041252_add_thumbnail_to_love_timelines_table', 1),
(22, '2025_10_27_152500_add_collection_fields_to_media_galleries_table', 1),
(23, '2025_10_27_160500_create_memory_lane_configs_table', 1),
(24, '2025_10_30_000001_create_locations_table', 1),
(25, '2025_10_30_121500_update_spotify_token_column_lengths', 1),
(26, '2025_10_30_131000_create_space_invitations_table', 1),
(27, '2025_10_30_140000_create_space_separation_requests_table', 1),
(28, '2025_10_30_150000_create_nobar_schedules_table', 1),
(29, '2025_11_01_000000_create_notifications_table', 1),
(30, '2025_11_03_121211_add_level_images_to_memory_lane_configs_table', 1),
(31, '2025_11_05_083141_update_mood_enum_in_love_journals_table', 1),
(32, '2025_11_06_020554_add_profile_image_to_users_table', 1),
(33, '2025_11_06_073146_create_listening_plans_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `nobar_schedules`
--

CREATE TABLE `nobar_schedules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `space_id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `scheduled_for` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id` bigint(20) UNSIGNED NOT NULL,
  `data` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `spaces`
--

CREATE TABLE `spaces` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `slug` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `user_one_id` bigint(20) UNSIGNED NOT NULL,
  `user_two_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 0,
  `theme_id` bigint(20) UNSIGNED DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `spaces`
--

INSERT INTO `spaces` (`id`, `slug`, `title`, `user_one_id`, `user_two_id`, `is_public`, `theme_id`, `bio`, `created_at`, `updated_at`) VALUES
(1, 'my-space', 'My Space', 1, 2, 0, NULL, 'This is my personal space.', '2025-11-06 16:03:27', '2025-11-06 16:03:27');

-- --------------------------------------------------------

--
-- Table structure for table `space_invitations`
--

CREATE TABLE `space_invitations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `space_id` bigint(20) UNSIGNED NOT NULL,
  `inviter_id` bigint(20) UNSIGNED NOT NULL,
  `invitee_id` bigint(20) UNSIGNED DEFAULT NULL,
  `invitee_email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `status` enum('pending','accepted','declined','cancelled') NOT NULL DEFAULT 'pending',
  `accepted_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `space_separation_requests`
--

CREATE TABLE `space_separation_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `space_id` bigint(20) UNSIGNED NOT NULL,
  `initiator_id` bigint(20) UNSIGNED NOT NULL,
  `partner_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `initiator_reason` text DEFAULT NULL,
  `partner_reason` text DEFAULT NULL,
  `initiator_confirmed_at` timestamp NULL DEFAULT NULL,
  `partner_confirmed_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `spotify_capsules`
--

CREATE TABLE `spotify_capsules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `space_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `spotify_track_id` varchar(255) NOT NULL,
  `track_name` varchar(255) NOT NULL,
  `artists` varchar(255) NOT NULL,
  `moment` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `saved_at` date DEFAULT NULL,
  `preview_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `spotify_surprise_drops`
--

CREATE TABLE `spotify_surprise_drops` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `space_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `spotify_track_id` varchar(255) NOT NULL,
  `track_name` varchar(255) NOT NULL,
  `artists` varchar(255) NOT NULL,
  `scheduled_for` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `note` text DEFAULT NULL,
  `curator_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `spotify_tokens`
--

CREATE TABLE `spotify_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `space_id` bigint(20) UNSIGNED DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `refresh_token` text DEFAULT NULL,
  `expires_in` int(10) UNSIGNED NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `scope` text DEFAULT NULL,
  `token_type` varchar(255) NOT NULL DEFAULT 'Bearer',
  `shared_playlist_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `surprise_notes`
--

CREATE TABLE `surprise_notes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `space_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `unlock_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `themes`
--

CREATE TABLE `themes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `primary_color` varchar(255) NOT NULL DEFAULT '#498386',
  `secondary_color` varchar(255) NOT NULL DEFAULT '#CFCAB5',
  `background_color` varchar(255) NOT NULL DEFAULT '#FFF7E2',
  `font_family` varchar(255) NOT NULL DEFAULT 'Montserrat',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `themes`
--

INSERT INTO `themes` (`id`, `name`, `primary_color`, `secondary_color`, `background_color`, `font_family`, `created_at`, `updated_at`) VALUES
(1, 'Classic Love', '#E63946', '#F1FAEE', '#FFF0F3', 'Georgia', '2025-11-06 16:03:27', '2025-11-06 16:03:27'),
(2, 'Ocean Breeze', '#1D3557', '#A8DADC', '#F1FAEE', 'Montserrat', '2025-11-06 16:03:27', '2025-11-06 16:03:27'),
(3, 'Forest Harmony', '#2A9D8F', '#E9C46A', '#F4F1DE', 'Roboto', '2025-11-06 16:03:27', '2025-11-06 16:03:27'),
(4, 'Minimal White', '#222222', '#555555', '#FFFFFF', 'Helvetica', '2025-11-06 16:03:27', '2025-11-06 16:03:27'),
(5, 'Romantic Pastel', '#FFB6B9', '#FAE3D9', '#FFF5E1', 'Poppins', '2025-11-06 16:03:27', '2025-11-06 16:03:27');

-- --------------------------------------------------------

--
-- Table structure for table `timelines`
--

CREATE TABLE `timelines` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `content` text NOT NULL,
  `media` varchar(255) DEFAULT NULL,
  `tag` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `partner_code` varchar(255) DEFAULT NULL,
  `auth_provider` varchar(32) DEFAULT NULL,
  `provider_id` varchar(191) DEFAULT NULL,
  `provider_avatar` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `profile_image`, `email_verified_at`, `password`, `username`, `partner_code`, `auth_provider`, `provider_id`, `provider_avatar`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'User', 'user@spacelovee.my.id', NULL, NULL, '$2y$12$UWDv8laI12me20fh5bGTSemRmMQcwPe2z6EPqmC2guRAl3KHSGg.m', 'admin', NULL, NULL, NULL, NULL, NULL, '2025-11-06 16:03:26', '2025-11-06 16:03:26'),
(2, 'User1', 'user1@spacelovee.my.id', NULL, NULL, '$2y$12$3/2cc/ivIe5aMjKXomKe0u0iiuCyai0Gbf4ixJZvVKecRtHGj0PUi', 'daniel', NULL, NULL, NULL, NULL, NULL, '2025-11-06 16:03:27', '2025-11-06 16:03:27');

-- --------------------------------------------------------

--
-- Table structure for table `wishlist_items`
--

CREATE TABLE `wishlist_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `space_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `status` enum('pending','done') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `countdowns`
--
ALTER TABLE `countdowns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `countdowns_space_id_foreign` (`space_id`);

--
-- Indexes for table `daily_messages`
--
ALTER TABLE `daily_messages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `daily_messages_space_id_date_unique` (`space_id`,`date`);

--
-- Indexes for table `docs`
--
ALTER TABLE `docs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `docs_space_id_foreign` (`space_id`),
  ADD KEY `docs_user_id_foreign` (`user_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `listening_plans`
--
ALTER TABLE `listening_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `listening_plans_space_id_foreign` (`space_id`),
  ADD KEY `listening_plans_user_id_foreign` (`user_id`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `locations_user_id_foreign` (`user_id`);

--
-- Indexes for table `love_journals`
--
ALTER TABLE `love_journals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `love_journals_space_id_foreign` (`space_id`),
  ADD KEY `love_journals_user_id_foreign` (`user_id`);

--
-- Indexes for table `love_timelines`
--
ALTER TABLE `love_timelines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `love_timelines_space_id_foreign` (`space_id`);

--
-- Indexes for table `media_galleries`
--
ALTER TABLE `media_galleries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `media_galleries_space_id_foreign` (`space_id`),
  ADD KEY `media_galleries_user_id_foreign` (`user_id`),
  ADD KEY `media_galleries_collection_key_index` (`collection_key`),
  ADD KEY `media_galleries_collection_key_collection_index_index` (`collection_key`,`collection_index`);

--
-- Indexes for table `memory_lane_configs`
--
ALTER TABLE `memory_lane_configs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `memory_lane_configs_space_id_unique` (`space_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nobar_schedules`
--
ALTER TABLE `nobar_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `nobar_schedules_space_id_foreign` (`space_id`),
  ADD KEY `nobar_schedules_created_by_foreign` (`created_by`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_foreign` (`user_id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `spaces`
--
ALTER TABLE `spaces`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `spaces_slug_unique` (`slug`),
  ADD KEY `spaces_user_one_id_foreign` (`user_one_id`),
  ADD KEY `spaces_user_two_id_foreign` (`user_two_id`),
  ADD KEY `spaces_theme_id_foreign` (`theme_id`);

--
-- Indexes for table `space_invitations`
--
ALTER TABLE `space_invitations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `space_invitations_token_unique` (`token`),
  ADD KEY `space_invitations_space_id_foreign` (`space_id`),
  ADD KEY `space_invitations_inviter_id_foreign` (`inviter_id`),
  ADD KEY `space_invitations_invitee_id_foreign` (`invitee_id`);

--
-- Indexes for table `space_separation_requests`
--
ALTER TABLE `space_separation_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `space_separation_requests_space_id_foreign` (`space_id`),
  ADD KEY `space_separation_requests_initiator_id_foreign` (`initiator_id`),
  ADD KEY `space_separation_requests_partner_id_foreign` (`partner_id`);

--
-- Indexes for table `spotify_capsules`
--
ALTER TABLE `spotify_capsules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `spotify_capsules_user_id_foreign` (`user_id`),
  ADD KEY `spotify_capsules_space_id_saved_at_index` (`space_id`,`saved_at`);

--
-- Indexes for table `spotify_surprise_drops`
--
ALTER TABLE `spotify_surprise_drops`
  ADD PRIMARY KEY (`id`),
  ADD KEY `spotify_surprise_drops_user_id_foreign` (`user_id`),
  ADD KEY `spotify_surprise_drops_space_id_scheduled_for_index` (`space_id`,`scheduled_for`);

--
-- Indexes for table `spotify_tokens`
--
ALTER TABLE `spotify_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `spotify_tokens_user_id_space_id_unique` (`user_id`,`space_id`),
  ADD KEY `spotify_tokens_space_id_foreign` (`space_id`);

--
-- Indexes for table `surprise_notes`
--
ALTER TABLE `surprise_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `surprise_notes_space_id_foreign` (`space_id`),
  ADD KEY `surprise_notes_user_id_foreign` (`user_id`);

--
-- Indexes for table `themes`
--
ALTER TABLE `themes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `timelines`
--
ALTER TABLE `timelines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timelines_user_id_foreign` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD UNIQUE KEY `users_auth_provider_provider_id_unique` (`auth_provider`,`provider_id`),
  ADD KEY `users_auth_provider_index` (`auth_provider`);

--
-- Indexes for table `wishlist_items`
--
ALTER TABLE `wishlist_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wishlist_items_space_id_foreign` (`space_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `countdowns`
--
ALTER TABLE `countdowns`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `daily_messages`
--
ALTER TABLE `daily_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `docs`
--
ALTER TABLE `docs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `listening_plans`
--
ALTER TABLE `listening_plans`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `love_journals`
--
ALTER TABLE `love_journals`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `love_timelines`
--
ALTER TABLE `love_timelines`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `media_galleries`
--
ALTER TABLE `media_galleries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `memory_lane_configs`
--
ALTER TABLE `memory_lane_configs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `nobar_schedules`
--
ALTER TABLE `nobar_schedules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `spaces`
--
ALTER TABLE `spaces`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `space_invitations`
--
ALTER TABLE `space_invitations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `space_separation_requests`
--
ALTER TABLE `space_separation_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `spotify_capsules`
--
ALTER TABLE `spotify_capsules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `spotify_surprise_drops`
--
ALTER TABLE `spotify_surprise_drops`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `spotify_tokens`
--
ALTER TABLE `spotify_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `surprise_notes`
--
ALTER TABLE `surprise_notes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `themes`
--
ALTER TABLE `themes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `timelines`
--
ALTER TABLE `timelines`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `wishlist_items`
--
ALTER TABLE `wishlist_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `countdowns`
--
ALTER TABLE `countdowns`
  ADD CONSTRAINT `countdowns_space_id_foreign` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `daily_messages`
--
ALTER TABLE `daily_messages`
  ADD CONSTRAINT `daily_messages_space_id_foreign` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `docs`
--
ALTER TABLE `docs`
  ADD CONSTRAINT `docs_space_id_foreign` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `docs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `listening_plans`
--
ALTER TABLE `listening_plans`
  ADD CONSTRAINT `listening_plans_space_id_foreign` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `listening_plans_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `locations`
--
ALTER TABLE `locations`
  ADD CONSTRAINT `locations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `love_journals`
--
ALTER TABLE `love_journals`
  ADD CONSTRAINT `love_journals_space_id_foreign` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `love_journals_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `love_timelines`
--
ALTER TABLE `love_timelines`
  ADD CONSTRAINT `love_timelines_space_id_foreign` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `media_galleries`
--
ALTER TABLE `media_galleries`
  ADD CONSTRAINT `media_galleries_space_id_foreign` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `media_galleries_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `memory_lane_configs`
--
ALTER TABLE `memory_lane_configs`
  ADD CONSTRAINT `memory_lane_configs_space_id_foreign` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `nobar_schedules`
--
ALTER TABLE `nobar_schedules`
  ADD CONSTRAINT `nobar_schedules_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `nobar_schedules_space_id_foreign` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `spaces`
--
ALTER TABLE `spaces`
  ADD CONSTRAINT `spaces_theme_id_foreign` FOREIGN KEY (`theme_id`) REFERENCES `themes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `spaces_user_one_id_foreign` FOREIGN KEY (`user_one_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `spaces_user_two_id_foreign` FOREIGN KEY (`user_two_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `space_invitations`
--
ALTER TABLE `space_invitations`
  ADD CONSTRAINT `space_invitations_invitee_id_foreign` FOREIGN KEY (`invitee_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `space_invitations_inviter_id_foreign` FOREIGN KEY (`inviter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `space_invitations_space_id_foreign` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `space_separation_requests`
--
ALTER TABLE `space_separation_requests`
  ADD CONSTRAINT `space_separation_requests_initiator_id_foreign` FOREIGN KEY (`initiator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `space_separation_requests_partner_id_foreign` FOREIGN KEY (`partner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `space_separation_requests_space_id_foreign` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `spotify_capsules`
--
ALTER TABLE `spotify_capsules`
  ADD CONSTRAINT `spotify_capsules_space_id_foreign` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `spotify_capsules_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `spotify_surprise_drops`
--
ALTER TABLE `spotify_surprise_drops`
  ADD CONSTRAINT `spotify_surprise_drops_space_id_foreign` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `spotify_surprise_drops_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `spotify_tokens`
--
ALTER TABLE `spotify_tokens`
  ADD CONSTRAINT `spotify_tokens_space_id_foreign` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `spotify_tokens_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `surprise_notes`
--
ALTER TABLE `surprise_notes`
  ADD CONSTRAINT `surprise_notes_space_id_foreign` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `surprise_notes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `timelines`
--
ALTER TABLE `timelines`
  ADD CONSTRAINT `timelines_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlist_items`
--
ALTER TABLE `wishlist_items`
  ADD CONSTRAINT `wishlist_items_space_id_foreign` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
