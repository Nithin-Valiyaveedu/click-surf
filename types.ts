export interface PlaceType {
  id: string;
  name: string;
  description: string;
  emoji: string;
  promptContext: string;
}

export interface DiscoveredPlace {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rating?: number; // Rating out of 5
}

export type NodeItem = PlaceType | DiscoveredPlace;

export interface GroundingSource {
  type: "web" | "maps";
  uri: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  sources?: GroundingSource[];
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}
