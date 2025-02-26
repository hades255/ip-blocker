/*
  # Initial Schema Setup for IP Blocker

  1. New Tables
    - `websites` - Store connected website information
      - `id` (uuid, primary key)
      - `domain` (text, unique)
      - `user_id` (uuid) - References auth.users
      - `created_at` (timestamp)
      
    - `ip_blocks` - Store blocked IP addresses
      - `id` (uuid, primary key)
      - `website_id` (uuid) - References websites
      - `ip_address` (text)
      - `reason` (text)
      - `created_at` (timestamp)
      
    - `country_blocks` - Store blocked countries
      - `id` (uuid, primary key)
      - `website_id` (uuid) - References websites
      - `country_code` (text)
      - `created_at` (timestamp)
      
    - `visits` - Store visit logs
      - `id` (uuid, primary key)
      - `website_id` (uuid) - References websites
      - `ip_address` (text)
      - `country_code` (text)
      - `user_agent` (text)
      - `device_type` (text)
      - `browser` (text)
      - `is_bot` (boolean)
      - `is_blocked` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create websites table
CREATE TABLE websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE websites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own websites"
  ON websites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create ip_blocks table
CREATE TABLE ip_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid REFERENCES websites ON DELETE CASCADE NOT NULL,
  ip_address text NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(website_id, ip_address)
);

ALTER TABLE ip_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage IP blocks for their websites"
  ON ip_blocks
  FOR ALL
  TO authenticated
  USING (
    website_id IN (
      SELECT id FROM websites WHERE user_id = auth.uid()
    )
  );

-- Create country_blocks table
CREATE TABLE country_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid REFERENCES websites ON DELETE CASCADE NOT NULL,
  country_code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(website_id, country_code)
);

ALTER TABLE country_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage country blocks for their websites"
  ON country_blocks
  FOR ALL
  TO authenticated
  USING (
    website_id IN (
      SELECT id FROM websites WHERE user_id = auth.uid()
    )
  );

-- Create visits table
CREATE TABLE visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid REFERENCES websites ON DELETE CASCADE NOT NULL,
  ip_address text NOT NULL,
  country_code text,
  user_agent text,
  device_type text,
  browser text,
  is_bot boolean DEFAULT false,
  is_blocked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view visits for their websites"
  ON visits
  FOR SELECT
  TO authenticated
  USING (
    website_id IN (
      SELECT id FROM websites WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert visits for their websites"
  ON visits
  FOR INSERT
  TO authenticated
  WITH CHECK (
    website_id IN (
      SELECT id FROM websites WHERE user_id = auth.uid()
    )
  );