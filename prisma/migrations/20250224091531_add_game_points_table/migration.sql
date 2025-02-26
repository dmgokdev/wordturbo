-- AlterTable
ALTER TABLE `players` ADD COLUMN `game_points` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `rooms` ADD COLUMN `entry_points` INTEGER NOT NULL DEFAULT 0;
