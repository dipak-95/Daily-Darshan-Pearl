export type VideoContent = {
    morningAarti?: string;
    eveningAarti?: string;
    morningDarshan?: string;
    eveningDarshan?: string;
};

export type Temple = {
    id: string;
    name: string;
    nameHindi?: string;
    location: string;
    locationHindi?: string;
    image: string;
    description: string;
    descriptionHindi?: string;
    videos: Record<string, VideoContent>;
};

export type Poonam = {
    id: string;
    startDateTime: string;
    endDateTime: string;
    description: string;
    descriptionHindi?: string;
};

export type Grahan = {
    id: string;
    startDateTime: string;
    endDateTime: string;
    affectedPlaces: string;
    affectedPlacesHindi?: string;
    description: string;
    descriptionHindi?: string;
};
