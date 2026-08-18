ALTER TABLE
  operational_workspace.depots
ADD
  COLUMN latitude double precision NOT NULL DEFAULT 0,
ADD
  COLUMN longitude double precision NOT NULL DEFAULT 0;

ALTER TABLE
  operational_workspace.depots
ADD
  CONSTRAINT depots_latitude_range_check CHECK (latitude BETWEEN -90 AND 90),
ADD
  CONSTRAINT depots_longitude_range_check CHECK (
    longitude BETWEEN -180 AND 180
  );

ALTER TABLE
  operational_workspace.depots
ALTER COLUMN latitude DROP DEFAULT,
ALTER COLUMN longitude DROP DEFAULT;

ALTER TABLE
  operational_workspace.shipments
ADD
  COLUMN pickup_latitude double precision NOT NULL DEFAULT 0,
ADD
  COLUMN pickup_longitude double precision NOT NULL DEFAULT 0,
ADD
  COLUMN delivery_latitude double precision NOT NULL DEFAULT 0,
ADD
  COLUMN delivery_longitude double precision NOT NULL DEFAULT 0;

ALTER TABLE
  operational_workspace.shipments
ADD
  CONSTRAINT shipments_pickup_latitude_range_check CHECK (
    pickup_latitude BETWEEN -90 AND 90
  ),
ADD
  CONSTRAINT shipments_pickup_longitude_range_check CHECK (
    pickup_longitude BETWEEN -180 AND 180
  ),
ADD
  CONSTRAINT shipments_delivery_latitude_range_check CHECK (
    delivery_latitude BETWEEN -90 AND 90
  ),
ADD
  CONSTRAINT shipments_delivery_longitude_range_check CHECK (
    delivery_longitude BETWEEN -180 AND 180
  );

ALTER TABLE
  operational_workspace.shipments
ALTER COLUMN pickup_latitude DROP DEFAULT,
ALTER COLUMN pickup_longitude DROP DEFAULT,
ALTER COLUMN delivery_latitude DROP DEFAULT,
ALTER COLUMN delivery_longitude DROP DEFAULT;