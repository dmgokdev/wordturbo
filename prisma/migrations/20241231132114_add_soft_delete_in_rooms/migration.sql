-- AlterTable
ALTER TABLE `games` ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `rooms` ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false;
