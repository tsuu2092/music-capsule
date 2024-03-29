export interface Song {
    fileName: string
    title: string
    channel: string
    length: number
    startTime?: number
    thumbnailUrl: string
    youtubeUrl: string
}

export interface SongQueues {
    [roomId: string]: Song[]
}

export interface WithRoomId {
    roomId: string
}
export interface AddSongMessageDto {
    url: string
}

export interface AddSongDto extends AddSongMessageDto, WithRoomId {}
