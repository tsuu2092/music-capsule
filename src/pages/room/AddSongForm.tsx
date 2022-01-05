import { chakra, Input, Button } from '@chakra-ui/react'
import { FC, useState, FormEvent, useEffect } from 'react'
import {
	ADD_SONG,
	ADD_SONG_SUCCESS,
	ADD_SONG_FAILED,
} from 'src/common/constants/stream.event'
import { Song } from 'src/common/core/stream/stream.interface'
import useInput from 'src/common/hooks/useInput'
import { useErrorToast, useSuccessToast } from 'src/components/shared/toast'
import { useLobbyContext } from 'src/contexts/LobbyContext'
import { useRoomContext } from 'src/contexts/RoomContext'
import { useSocket } from 'src/contexts/SocketContext'

const AddSongForm: FC = () => {
	const socket = useSocket()
	const { joinedLobby } = useLobbyContext()
	const { loading, room } = useRoomContext()
	const [submitting, setSubmitting] = useState(false)
	const errorToast = useErrorToast()
	const successToast = useSuccessToast()

	const { value: url, onInput: onUrlInput, reset: resetUrlInput } = useInput('')
	const addSong = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		e.stopPropagation()
		setSubmitting(true)
		socket.emit(ADD_SONG, { url })
	}

	useEffect(() => {
		const addSongSuccess = ({ song }: { song: Song }) => {
			setSubmitting(false)
			successToast({
				title: 'Add song successfully',
				description: `${song.title} has been added to queue`,
			})
			resetUrlInput()
		}
		const addSongFailed = ({ message }: { message: string }) => {
			setSubmitting(false)
			errorToast({
				title: 'Add song failed',
				description: message,
			})
		}
		socket.on(ADD_SONG_SUCCESS, addSongSuccess)
		socket.on(ADD_SONG_FAILED, addSongFailed)
		return () => {
			socket.off(ADD_SONG_SUCCESS, addSongSuccess)
			socket.off(ADD_SONG_FAILED, addSongFailed)
		}
	}, [])

	useEffect(() => {
		if (loading) return
	}, [loading])

	return (
		<chakra.form onSubmit={addSong} display="flex">
			<Input
				color="white"
				value={url}
				onInput={onUrlInput}
				placeholder="Search YouTube / Insert YouTube URL"
				borderColor="green.light"
				focusBorderColor="green.main"
				borderRadius={'sm'}
				mr={2}
				isRequired
			/>
			<Button
				_focus={{ boxShadow: 'none' }}
				colorScheme={'whatsapp'}
				type="submit"
				isLoading={submitting}
				width={'fit-content'}
				px={6}
				fontSize={['sm', 'sm', 'sm', 'sm']}
			>
				Add
			</Button>
		</chakra.form>
	)
}

export default AddSongForm
