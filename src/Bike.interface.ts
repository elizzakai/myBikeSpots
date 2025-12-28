export default interface Bike {
  id: number;
  title: string;
  manufacturer_name?: string;
  frame_model?: string;
  frame_colors?: string[];
  year?: number | null;
  serial?: string;
  status: string;
  stolen: boolean;
  stolen_location?: string;
  stolen_coordinates?: [number, number];
  date_stolen?: number;
  description?: string | null;
  url: string;
  thumb?: string | null;
  large_img?: string | null;
  propulsion_type_slug?: string;
  cycle_type_slug?: string;
}

