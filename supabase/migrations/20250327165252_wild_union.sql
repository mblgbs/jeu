/*
  # Create saves table for game state persistence

  1. New Tables
    - `saves`
      - `id` (bigint, primary key)
      - `user_id` (uuid, references auth.users)
      - `game_state` (jsonb)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `saves` table
    - Add policies for authenticated users to:
      - Read their own saves
      - Create new saves
      - Update their existing saves
*/

CREATE TABLE IF NOT EXISTS saves (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES auth.users NOT NULL,
  game_state jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own saves"
  ON saves
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saves"
  ON saves
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saves"
  ON saves
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);