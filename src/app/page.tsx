import Image from 'next/image';
import Chat from '../components/chat';

export default function Home() {
    


  return (
    <main className="h-screen flex-none bg-gradient-to-r from-[#121212] to-[#000000]">
        <Chat />
    </main>
  )
}
