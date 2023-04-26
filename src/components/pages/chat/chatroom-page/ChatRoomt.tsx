import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { AxiosError, AxiosResponse } from 'axios';
import { Socket, io } from 'socket.io-client';
import { useQuery } from 'react-query';
import Layout from '../../../commons/layout/Layout';
import InputChat from './components/InputChat';
import MessageList from './components/MessageList';
import { Message } from './components/Message';
import Header from '../../../commons/header/Header';
import { IChat, IChatLog, IEnterReply, IError, ISendedMessage } from '.';
import { getChatRoomLog } from '../../../../api/Channel';

const Base = styled.div`
  position: relative;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 64px;
  align-items: center;
  padding: 0 24px;
`;

export default function ChatRoom() {
  const socketRef = useRef<Socket | null>(null);
  const scrollBottomRef = useRef<HTMLLIElement>(null);
  const { id } = useParams<string>();

  //   const { data: profileData } = useQuery<AxiosResponse<IProfile>, AxiosError>(
  //     'fetchMyProfile',
  //     fetchMyProfile,
  //   );
  //   const { data: chatRoomDetailData } = useQuery<
  //     AxiosResponse<IRoom>,
  //     AxiosError
  //   >(['fetchChatRoomDetail', roomId], () =>
  //     fetchChatRoomDetail(roomId as string),
  //   );

  const [messages, setMessages] = useState<Array<IChat>>([]);

  // const { data: chatListData } = useQuery<
  //   AxiosResponse<Array<IReceivedMessage>>,
  //   AxiosError
  // >(['fetchChatMessageList', roomId, messages], () =>
  //   fetchChatMessageList(roomId as string),
  // );

  const {
    isLoading,
    isError,
    data: chatListData,
  } = useQuery<IChatLog, AxiosError>('channels', () =>
    getChatRoomLog(id || '').then(
      (response: AxiosResponse<IChatLog>) => response.data,
    ),
  );

  // const mutation = useMutation('sendChatMessage', (content: string) =>
  //   sendChatMessage(roomId as string, content),
  // );

  const handleSend = (content: ISendedMessage) => {
    socketRef.current?.emit('chat', content, (newMessage: IChat) => {
      console.log('Received new message from server:', newMessage);

      setMessages(prevMessages => [...prevMessages, newMessage]);
    });
  };

  useEffect(() => {
    socketRef.current = io(
      `${process.env.REACT_APP_BASE_BACKEND_URL}/channel`,
      {
        path: '/socket.io',
        extraHeaders: {
          authorization: `Bearer ${process.env.REACT_APP_BASE_TOKEN}`,
        },
      },
    );

    socketRef.current.emit('enterChannel', id);

    // eslint-disable-next-line no-undef
    socketRef.current?.on('message', (message: IEnterReply) => {
      // 채팅방에 글 띄우는 걸로 변경
      console.log(message);
    });

    socketRef.current.on('error', (error: IError) => {
      // 에러모달로 변경
      console.error(error);
    });

    socketRef.current.on('chat', (newMessage: IChat) => {
      setMessages(prevMessages => {
        return [...prevMessages, newMessage];
      });
    });

    return () => {
      socketRef.current?.off('error');
      socketRef.current?.off('chat');
    };
  }, []);

  useEffect(() => {
    if (chatListData) {
      setMessages(chatListData.chat);
    }
  }, [chatListData]);

  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Layout Header={<Header title="untitle" />}>
      <Base>
        {/* {chatRoomDetailData && (
          <TopNavigation title={chatRoomDetailData.data.user.username} />
        )} */}
        <Container>
          <MessageList>
            {messages.map((message: IChat) => (
              <Message
                key={message.chatId}
                receiver={message.userChannel.user.nickname}
                receiverThumbnailImage={message.userChannel.user.image}
                content={message.message}
                timestamp={message.time}
              />
            ))}
            <li ref={scrollBottomRef} />
          </MessageList>
        </Container>
        <InputChat onClick={handleSend} channelId={id} />
      </Base>
    </Layout>
  );
}
