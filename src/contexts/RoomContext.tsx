import { useBoolean } from '@chakra-ui/react'
import {
	createContext,
	FC,
	MutableRefObject,
	useContext,
	useRef,
	useState,
} from 'react'
import {
	Room,
	Users,
	UserWithSocketId,
} from 'src/common/core/lobby/lobby.interface'
import LobbyService from 'src/common/core/lobby/lobby.service'
import { Song } from 'src/common/core/stream/stream.interface'
import useLocalStorage from 'src/common/hooks/useLocalStorage'

interface RoomContextProps {
	room?: Room
	queue: Song[]
	users: Users
	addSong: (song: Song) => any
	nextSong: () => any
	fetchRoom: (roomId: string) => any
	leaveRoom: () => any
	addUser: (user: UserWithSocketId) => any
	deleteUser: (socketId: string) => any
	loading: boolean
	playingRef: MutableRefObject<boolean>
	volume: number
	setVolume: (volume: number) => any
	currentTime: number
	setCurrentTime: (time: number) => any
	muted: boolean
	setMuted: (muted: boolean) => any
	toggleMuted: () => any
}

export const RoomContext = createContext<RoomContextProps | undefined>(
	undefined,
)
export const RoomProvider: FC = ({ children }) => {
	const [room, setRoom] = useState<Room>()
	const [queue, setQueue] = useState<Song[]>([])
	const [users, setUsers] = useState<Users>({})
	const [loading, setLoading] = useState(true)
	const [volume, setVolume] = useLocalStorage('volume', 0.5)
	const [muted, setMuted] = useBoolean(false)
	const playingRef = useRef<boolean>(false)
	const [currentTime, setCurrentTime] = useState(0)

	const leaveRoom = () => {
		setRoom(undefined)
		setQueue([])
		setUsers({})
		setLoading(true)
		playingRef.current = false
		setCurrentTime(0)
		// setMuted.off()
	}
	const fetchRoom = async (roomId: string) => {
		try {
			const { id, name, queue, users } = await LobbyService.getRoom(roomId)
			setRoom({ id, name })
			setQueue(queue)
			setUsers(users)
		} catch (e) {
		} finally {
			setLoading(false)
		}
	}
	const addSong = (song: Song) => {
		setQueue((queue) => [...queue, song])
	}

	const nextSong = () => {
		setQueue((queue) => {
			console.log(
				'🚀 ~ file: RoomContext.tsx ~ line 32 ~ setQueue ~ queue',
				queue,
			)
			const newQueue = [...queue]
			newQueue.shift()
			console.log(
				'🚀 ~ file: RoomContext.tsx ~ line 35 ~ setQueue ~ newQueue',
				newQueue,
			)
			return newQueue
		})
	}

	const addUser = (user: UserWithSocketId) => {
		setUsers((users) => ({ ...users, [user.socketId]: user }))
	}

	const deleteUser = (socketId: string) => {
		setUsers((users) => {
			const newRooms = { ...users }
			delete newRooms[socketId]
			return newRooms
		})
	}

	const _setMuted = (muted: boolean) => {
		if (muted) setMuted.on()
		else setMuted.off()
	}

	const value = {
		room,
		queue,
		addSong,
		nextSong,
		fetchRoom,
		loading,
		users,
		leaveRoom,
		playingRef,
		addUser,
		deleteUser,
		volume,
		setVolume,
		currentTime,
		setCurrentTime,
		muted,
		setMuted: _setMuted,
		toggleMuted: setMuted.toggle,
	}

	return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>
}

export const useRoomContext = () => {
	const context = useContext(RoomContext)
	if (context === undefined)
		throw new Error('useRoomContext must be within RoomProvider')
	return context
}
