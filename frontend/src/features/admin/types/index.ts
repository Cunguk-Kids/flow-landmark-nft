export interface EventForm {
  image: string;
  id: string;
  title: string;
  description: string;
  date: Date | undefined;
  time: string;
  latitude: number;
  longitude: number;
  capacity: number;
  registered: number;
  rareNft: number;
}
