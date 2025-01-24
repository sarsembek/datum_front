<template>
    <div class="builder-group">
        <builder-message
            @create-answer="editableAutomatizationMessage = null; messagePopupOpen = true"
            @edit-automatization-message="editableAutomatizationMessage = $event; messagePopupOpen = true"
        />
        <bilder-message-popup
            v-if="messagePopupOpen"
            :automatization-message="editableAutomatizationMessage"
            @close="messagePopupOpen = false"
        />
    </div>
</template>

<script setup lang="ts">
const editableAutomatizationMessage = ref<any>(null)

const messagePopupOpen = ref<boolean>(false)

</script>

<style scoped lang="scss">
.builder-group{
    padding-top: 20px;
}
</style>
