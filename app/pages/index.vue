<template>
    <div class="bg-black w-screen min-h-screen flex flex-col items-center justify-center text-white">
        <div class="fixed top-0 left-0 right-0 flex flex-row space-x-5 p-4 bg-black">
            <button @click="local.flipX = !local.flipX">Flip X</button>
            <button @click="local.flipY= !local.flipY">Flip Y</button>
            <button @click="state.fontSize += 4">+ Font</button>
            <button @click="state.fontSize -= 4">- Font</button>
            <button @click="state.height += 1">+ Height</button>
            <button @click="state.height -= 1">- Height</button>
            <button @click="state.width += 1">+ Width</button>
            <button @click="state.width -= 1">- Width</button>
        </div>
        <div class="flex flex-col items-center justify-center w-full h-full mt-16">
            <div class="border-yellow-300 border-4 overflow-y-scroll p-4 transition-all duration-300 ease-linear scrollbar-hide"
                 contenteditable="true" @input="text = $event.target.innerText"
                 :style="{ fontSize: state.fontSize + 'px', height: state.height + 'in', width: state.width + 'in', maxHeight: 'calc(100vh - 4rem)', transform: `scaleX(${local.flipX ? -1 : 1}) scaleY(${local.flipY ? -1 : 1})` }"
                 ref="el">
                {{ text }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { io } from 'socket.io-client';
import { useScroll } from '@vueuse/core';
import throttle from 'lodash/throttle';

// state for reactive variables (quick updating)
const state = reactive({
    fontSize: 64,
    height: 4,
    width: 4,
});
const text = ref('')

// local state for non-shared variables
const local = reactive({
    flipX: false,
    flipY: false,
})

const socket = io('http://localhost:8000');

const el = ref<HTMLElement | null>(null);

const { x, y } = useScroll(el)

socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('joinRoom', 'room1');
});

// called when new user joins and wants state
// full state contains text too.
socket.on('fullStateReq', () => emitState(true));

socket.connect();

// watch for scroll changes
watch(y, () => {
    throttleYUpdate()
});

// watch for state changes (not including text)
watch(state, () => {
    throttleEmitState();
});

// watch for text changes, so we emit full state
watch(text, () => {
    throttleEmitState(true);
});

const throttleEmitState = throttle(emitState, 1000); // throttle emit state (config stuff) to 1 second

const throttleYUpdate = throttle(() => {
    socket.emit('yUpdate', {
        room: 'room1',
        y: y.value
    });
}, 50); // throttle y update to 100ms

function emitState(full = false) {
    if (full) {
        socket.emit('state', {
            room: 'room1',
            state: {
                fontSize: state.fontSize,
                height: state.height,
                width: state.width,
                text: text.value,
            }
        });
    } else {
    socket.emit('state', {
        room: 'room1',
        state: {
            fontSize: state.fontSize,
            height: state.height,
            width: state.width,
        }
    });
    }
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
