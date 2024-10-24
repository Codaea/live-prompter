<template>
    <div class="bg-black w-screen h-screen text-white">
        <div class="flex flex-row space-x-5">
            <button @click="state.fontSize += 4">+ Font</button>
            <button @click="state.fontSize -= 4">- Font</button>
            <button @click="state.height += 1">+ Height</button>
            <button @click="state.height -= 1">- Height</button>
            <button @click="state.width += 1">+ Width</button>
            <button @click="state.width -= 1">- Width</button>
        </div>
        <div class="flex justify-center items-center min-h-screen">
        <div ref="el" 
        class="border-yellow-300 border-4 overflow-y-scroll p-4 transition-all duration-300 ease-linear scrollbar-hide" contenteditable="true" @input="state.text = $event.target.innerText"
            :style="{ fontSize: state.fontSize + 'px', height: state.height + 'in', width: state.width + 'in' }"
            >{{ state.text }}
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { io } from 'socket.io-client';
import { useScroll } from '@vueuse/core';

const state = reactive({
    fontSize: 64,
    height: 4,
    width: 4,
    text: 'Some Content here NGL',
    y: 0,
});


const socket = io('http://localhost:8000');

const el = ref<HTMLElement | null>(null);

const { x, y } = useScroll(el)

socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('joinRoom', 'room1');
});

// called when new user joins and wants state
socket.on('reqState', emitState);


socket.connect();

// watch for scroll changes
watch(y, () => {
    socket.emit('yUpdate', {
        room: 'room1', // Add room information
        y: y.value
    });
});

// watch for state changes
watch(state, () => {
    emitState();
});


function emitState() {
    socket.emit('state', {
        room: 'room1',
        state: {
            fontSize: state.fontSize,
            height: state.height,
            width: state.width,
            text: state.text
        }
    });
}

</script>

<style>
.scrollbar-hide {
    -ms-overflow-style: none;
    /* IE and Edge */
    scrollbar-width: none;
    /* Firefox */
}
</style>
