-- New migration file: 20240118000000_add_pets_functionality.sql
ALTER TABLE properties
ADD COLUMN pets_allowed boolean DEFAULT false,
ADD COLUMN pet_restrictions text[],
ADD COLUMN pet_deposit numeric;

-- Add comments for clarity
COMMENT ON COLUMN properties.pets_allowed IS 'Whether pets are allowed in the property';
COMMENT ON COLUMN properties.pet_restrictions IS 'Array of specific pet restrictions (e.g., ["no dogs over 30lbs", "cats only"])';
COMMENT ON COLUMN properties.pet_deposit IS 'Additional security deposit required for pets';