-- add new fields for timeline map view scenario --

ALTER TABLE [Timelines] ADD [MapType]	  NVARCHAR(1000) NOT NULL DEFAULT 'none';
ALTER TABLE [Exhibits]  ADD [MapAreaId]   NVARCHAR(200)  NULL	  DEFAULT NULL;
GO

-- note transformation completed --

INSERT INTO [MigrationHistory] (MigrationId, ProductVersion)
VALUES
    ('201407221617220_TimelineMapView', 'Manual Migration');
GO
