
export type VideoContent = {
    morningAarti?: string;
    eveningAarti?: string;
    morningDarshan?: string;
    eveningDarshan?: string;
};

export type ContentType = 'morningAarti' | 'eveningAarti' | 'morningDarshan' | 'eveningDarshan';

export type Temple = {
    id: string;
    name: string;
    nameHindi?: string;
    description: string;
    descriptionHindi: string;
    image: string;
    location: string;
    locationHindi: string;
    activeContentTypes: ContentType[];
    videos: Record<string, VideoContent>;
};

export type Poonam = {
    id: string;
    startDateTime: string; // ISO
    endDateTime: string;
    description: string;
    descriptionHindi: string;
};

export type Grahan = {
    id: string;
    startDateTime: string;
    endDateTime: string;
    affectedPlaces: string;
    affectedPlacesHindi: string;
    description: string;
    descriptionHindi: string;
};
