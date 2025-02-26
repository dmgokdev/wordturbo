-- AlterTable
ALTER TABLE `games` MODIFY `game_status` VARCHAR(191) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `rooms` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    ADD COLUMN `type` VARCHAR(191) NOT NULL DEFAULT 'public';
