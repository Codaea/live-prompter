<template>
    <div class="bg-black w-screen h-screen text-white">
        <div class="flex flex-row space-x-5">
        </div>
        <div class="flex justify-center items-center min-h-screen">
        <div ref="el" 
        class="border-yellow-300 border-4 overflow-y-scroll p-4 transition-all duration-300 ease-linear scrollbar-hide" @input="state.text = $event.target.innerText"
            :style="{ fontSize: state.fontSize + 'px', height: state.height + 'in', width: state.width + 'in' }"
            >{{ state.text }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000');

// shared state
const state = reactive({
    fontSize: 64,
    height: 4,
    width: 4,
    text: 'Connecting...',
    y: 0,
});

const xFlip = ref(false);
const yFlip = ref(false);

const el = ref<HTMLElement | null>(null);

const scroll  = useScroll(el);

socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('joinRoom', 'room1');
});

// reciving state from server
socket.on('state', (data: { fontSize: number, height: number, width: number, text: string }) => {
    state.fontSize = data.fontSize;
    state.height = data.height;
    state.width = data.width;
    state.text = data.text;
});

socket.on('yUpdate', (remoteY) => {
    scroll.y.value = remoteY; // set scroll y value to remote update
});

socket.connect();

onUnmounted(() => {
    socket.disconnect();
});
</script>

<style>
.scrollbar-hide {
    -ms-overflow-style: none;
    /* IE and Edge */
    scrollbar-width: none;
    /* Firefox */
}
</style>
