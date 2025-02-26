/*
  Warnings:

  - You are about to drop the column `game_status` on the `games` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `games` DROP COLUMN `game_status`,
    ADD COLUMN `end_time` DATETIME(3) NULL,
    ADD COLUMN `start_time` DATETIME(3) NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `players` ADD COLUMN `position` INTEGER NOT NULL DEFAULT 0;
