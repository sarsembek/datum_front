<template>
    <div class="search-box">
        <input-custom
            v-model="searchValue"
            class="search-box__search"
            placeholder="Search"
        />
        <div class="search-box__content">
            <div class="filter">
                <div class="filter__title">
                    Основные фильтры
                </div>
                <div
                    v-for="(filterItem, filterItemIndex) in filterItems"
                    :key="`filterItem-${filterItemIndex}`"
                    class="filter__item"
                    @click="activeItemsIndex = filterItemIndex"
                >
                    {{ filterItem.name }}
                </div>
            </div>
            <div class="data">
                <div
                    v-for="(item, itemIndex) in filteredData()"
                    :key="`teg-${itemIndex}`"
                    class="data__item"
                    @click="emit('click', item)"
                >
                    {{ item.name }}
                </div>
                <div
                    v-if="filteredData().length === 0"
                    class="empty"
                >
                    Нет данных
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

// interface filterItemsInterface {
//   name: string
//   data: any
// }

const searchValue = ref<string>('')
const activeItemsIndex = ref<number>(0)

const props = defineProps({
  filterItems: { type: Array<any>, required: true }
})

const filteredData = () => {
  if (searchValue.value) {
    return props.filterItems[activeItemsIndex.value].data.filter((e: any) => [e].some(
      val => val.name.toLowerCase().includes(searchValue.value.toLowerCase())))
  }
  return props.filterItems[activeItemsIndex.value].data
}

const emit = defineEmits(['click'])
</script>

<style lang="scss">
.search-box{
    width: 450px;
    padding: 15px;
    background-color: var(--bg-color-three);
    border-radius: 5px;
    box-shadow: 0px 0px 8px 0px rgba(43, 41, 41, 0.25);
    z-index: 10;
    &__search{
        margin-bottom: 10px;
        .input-content{
            width: 100%;
        }
    }
    &__content{
        display: flex;
        .filter{
            width: 35%;
            border-right: 1px solid var(--bg-color-two);
            padding-right: 5px;
            &__title{
                font-size: var(--font-size);
                margin-bottom: 10px;
                color: var(--gray-color);
            }
            &__item{
                cursor: pointer;
                font-size: var(--font-size-xs);
                &:not(:last-child){
                    margin-bottom: 7px;
                }
                &::first-letter {
                    text-transform: uppercase;
                }
                &:hover{
                    color: var(--hover-color);
                }
            }
        }
        .data{
            padding-left: 10px;
            width: 65%;
            height: 200px;
            overflow: scroll;
            &__item{
                cursor: pointer;
                font-size: var(--font-size-xs);
                &:not(:last-child){
                    margin-bottom: 7px;
                }
                &::first-letter {
                    text-transform: uppercase;
                }
                &:hover{
                    color: var(--hover-color);
                }
            }
            &::-webkit-scrollbar {
                display: none;
            }
            .empty{
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100%;
                color: var(--error-color-light);
            }
        }
    }
}
</style>
