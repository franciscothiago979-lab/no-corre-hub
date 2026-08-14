CREATE TABLE `workspaceSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`module` varchar(80) NOT NULL,
	`data` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspaceSnapshots_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspaceSnapshots_owner_module_idx` UNIQUE(`ownerId`,`module`)
);
