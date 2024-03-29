<template>
  <Popover class="relative w-fit py-4" :class="componentName">
    <PopoverButton
      ref="selectorButtonRef"
      data-test="popover-button"
      class="flex h-fit flex-nowrap items-center focus:outline-none"
      @click="calculateBlockMenuPosition"
    >
      <PlusIcon class="mx-1 h-5 w-5 text-primary" />
      <span class="ml-0.5 h-6 w-0.5 bg-primary"></span>
    </PopoverButton>

    <PopoverPanel
      ref="test"
      v-slot="{ close }"
      class="absolute -right-1 z-10 translate-x-full rounded-md bg-white px-2 py-2 shadow-md"
      :class="blockMenuPositionYAxis"
    >
      <div class="flex flex-col">
        <button
          v-for="definition in blockDefinitions"
          :key="definition.id"
          :data-test="definition.componentName"
          class="m-2 flex flex-row hover:cursor-pointer"
          @click="handleBlockClick(definition.typeId, close)"
        >
          <span v-if="false" class="h-[65px] w-[65px] overflow-hidden rounded-md">
            <img
              class="h-full w-full"
              :src="definition.options.icon"
              :alt="definition.title"
            />
          </span>
          <span class="flex flex-col whitespace-nowrap">
            <span class="text-md font-medium">{{ definition.title }}</span>
            <span v-if="false" class="text-base text-base-200">
              {{ definition.description }}
            </span>
          </span>
        </button>
      </div>
    </PopoverPanel>
  </Popover>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { PlusIcon } from '@heroicons/vue/outline'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { useBlocksStore } from '@/domain/blocks/base/services/stores/useBlocksStore.js'
import { useBlockDefinitionsStore } from '@/domain/blocks/base/services/stores/useBlockDefinitionsStore.js'
import { storeToRefs } from 'pinia'

export const componentName = 'BlockSelector'

export default defineComponent({
  name: componentName,
  components: {
    Popover,
    PopoverButton,
    PopoverPanel,
    PlusIcon,
  },
  props: {
    card: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const blocksStore = useBlocksStore()
    const { blockDefinitions } = storeToRefs(useBlockDefinitionsStore())

    const selectorButtonRef = ref(null)

    const blockMenuPositionYAxis = ref('top-4')

    const calculateBlockMenuPosition = () => {
      const parentElementOffsetTop =
        selectorButtonRef?.value?.el?.parentElement?.parentElement?.offsetTop ?? 0
      const parentElementOffsetHeight =
        selectorButtonRef?.value?.el?.parentElement?.parentElement?.offsetHeight ?? 1
      const selectorElementOffsetTop =
        selectorButtonRef?.value?.el?.parentElement?.offsetTop ?? 0

      blockMenuPositionYAxis.value =
        selectorElementOffsetTop - parentElementOffsetTop > parentElementOffsetHeight / 2
          ? 'bottom-4'
          : 'top-4'
    }

    const handleBlockClick = async (typeId, closePopover) => {
      closePopover()
      await blocksStore.addBlock(typeId, props.card)
    }

    return {
      componentName,
      calculateBlockMenuPosition,
      blockMenuPositionYAxis,
      selectorButtonRef,
      blockDefinitions,
      handleBlockClick,
    }
  },
})
</script>

<style scoped></style>
