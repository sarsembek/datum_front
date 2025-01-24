<template>
    <div class="automatization-group">
        <div class="folders">
            <div class="folders__header">
                Ваши папки
            </div>
            <div class="folders__content">
                <div
                    v-for="folder in folders"
                    :key="`folder-${folder.id}`"
                    v-click-outside="() => folder.menu_active = false"
                    class="folder"
                    :class="{'folder_active': activeFolder === folder.id}"
                    @click="changeActiveFolder(folder.id, folder.name)"
                >
                    <div class="folder__inner">
                        <div class="icon">
                            <svg-icon
                                icon="folder"
                                width="18"
                                height="18"
                                fill="#aaaeb7"
                            />
                        </div>
                        <div class="name">
                            {{ folder.name }}
                        </div>
                        <div
                            v-if="folder.name !== 'Шаблоны'"
                            class="context"
                            @click="openMenu(folder)"
                        >
                            <svg-icon
                                icon="menu"
                                width="24"
                                height="24"
                            />
                        </div>
                    </div>
                    <div
                        v-if="folder.menu_active && folder.name !== 'Шаблоны'"
                        class="folder__menu"
                    >
                        <div
                            class="func"
                            @click="openEditPopup('folder', folder)"
                        >
                            <svg-icon
                                icon="edit"
                                width="20"
                                height="20"
                                stroke="#aaaeb7"
                            />
                            Переименовать
                        </div>
                        <div
                            v-if="folders.length > 1"
                            class="func func_delete"
                            @click="deleteFolder(folder.id)"
                        >
                            <svg-icon
                                icon="delete"
                                width="24"
                                height="24"
                                fill="#eb5038"
                            />
                            Удалить
                        </div>
                    </div>
                </div>
                <button-custom
                    class="add-folder"
                    b-form="blue"
                    value="Создать папку"
                    @click="openCreatePopup('folder'); createType = 'folder'"
                />
            </div>
        </div>
        <div
            class="automations"
        >
            <div class="automations__header">
                Ваши автоматизации
            </div>
            <div class="automations__content">
                <div class="header">
                    <div class="header__item">
                        Название
                    </div>
                    <div class="header__item">
                        Количество выполнений
                    </div>
                    <div class="header__item">
                        CTR
                    </div>
                    <div class="header__item">
                        Последнее изменение
                    </div>
                </div>
                <div
                    v-for="(automation, automationIndex) in automations"
                    :key="`automation-${automationIndex}`"
                    class="automation"
                >
                    <nuxt-link
                        :to="
                            automation.is_template ? `/cms/${automation.id}?is_template=true` : `/cms/${automation.id}`"
                        class="automation__inner"
                    >
                        <div
                            class="status"
                            :class="{'status status_active': automation.status}"
                        />
                        <div class="name">
                            {{ automation.name }}
                        </div>
                        <div
                            v-if="automation.complete_count"
                            class="complete-count"
                        >
                            {{ automation.complete_count }}
                        </div>
                        <div
                            v-else
                            class="complete-count"
                        >
                            -
                        </div>
                        <div
                            v-if="automation.ctr_count"
                            class="ctr"
                        >
                            {{ automation.ctr_count }}
                        </div>
                        <div
                            v-else
                            class="ctr"
                        >
                            -
                        </div>
                        <div class="change-date">
                            {{ formattedDate(automationIndex) }}
                        </div>
                    </nuxt-link>
                    <div
                        class="context"
                        @click="openMenu(automation)"
                    >
                        <svg-icon
                            icon="menu"
                            width="24"
                            height="24"
                        />
                    </div>
                    <div
                        v-if="automation.menu_active"
                        v-click-outside="() => automation.menu_active = false"
                        class="automation__menu"
                    >
                        <div
                            class="func"
                            @click="openEditPopup('automation', automation)"
                        >
                            <svg-icon
                                icon="edit"
                                width="20"
                                height="20"
                                stroke="#aaaeb7"
                            />
                            Переименовать
                        </div>
                        <div
                            class="func func_delete"
                            @click="deleteCms(automation.id)"
                        >
                            <svg-icon
                                icon="delete"
                                width="24"
                                height="24"
                                fill="#eb5038"
                            />
                            Удалить
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <create-template
            v-if="createSettings.isTemplate && createSettings.isOpen"
            :type="createSettings.type"
            @close="createSettings.isOpen = false"
            @create="createFolderOrCms($event); createSettings.isOpen = false"
        />
        <create-popup
            v-else-if="createSettings.isOpen"
            :type="createSettings.type"
            @close="createSettings.isOpen = false"
            @create="createFolderOrCms($event); createSettings.isOpen = false"
        />
        <edit-popup
            v-if="editSettings.isOpen"
            :type="editSettings.type"
            :item="editSettings.currentItem"
            @close="editSettings.isOpen = false"
            @change="changeFolderOrCms($event)"
        />
    </div>
</template>

<script setup lang="ts">
import { useAutomatizationStore } from '~/store/automatization'
// import { useUserStore } from '~/store/user'
const { openCreatePopup } = useAutomatizationStore()
const { createType, createSettings, isTemplate } = storeToRefs(useAutomatizationStore())
// const user = useUserStore().user || await useUserStore().getUser()

const activeFolder = ref<number>(-1)
const editSettings = reactive({
  isOpen: false,
  type: '',
  currentItem: {}
})

const getFolders = async () => {
  const data: any = await useAuthFetch('/api/v1/cms/folder/', {
    method: 'get'
  })
  return data
}

const folders = reactive(await getFolders())
activeFolder.value = folders[0].id

const openMenu = (item: any) => {
  item.menu_active = !item.menu_active
}

const getAutomations = async () => {
  const activeFolderItem = folders.find((e: { id: any }) => e.id === activeFolder.value)
  // eslint-disable-next-line max-len
  const data: any = await useAuthFetch(`/api/v1/cms/automatization/?folder_id=${activeFolder.value}&is_template=${activeFolderItem.name === 'Шаблоны'}`, {
    method: 'get',
    headers: { 'Content-Type': 'application/json' }
  })
  return data
}

const automations = reactive(await getAutomations())

const formattedDate = (automationIndex: number) => {
  return new Date(automations[automationIndex].last_update_date).toLocaleString('ru-RU')
}

const changeFolderOrCms = async (e: any) => {
  const token = useCookie('boardToken').value
  const id = e.id
  const name = e.name

  if (editSettings.type === 'folder') {
    await useAuthFetch('/api/v1/cms/folder/', {
      method: 'put',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ folder_id: id, name })
    })
  } else if (editSettings.type === 'automation') {
    await useAuthFetch('/api/v1/cms/automatization/', {
      method: 'put',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ automatization_id: id, name })
    })
  }
  editSettings.isOpen = false
}

const createFolderOrCms = async (e: any) => {
  if (createType.value === 'automation') {
    const data: any = await useAuthFetch('/api/v1/cms/automatization/', {
      method: 'post',
      body: {
        folder_id: activeFolder.value,
        name: e.name,
        is_template: createSettings.value.isTemplate,
        template_id: e.template_id ? e.template_id : null
      },
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
    automations.push(data)
  }
  if (createType.value === 'folder') {
    const data: any = await useAuthFetch('/api/v1/cms/folder/', {
      method: 'post',
      body: { name: e.name },
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
    folders.push(data)
  }
}

const changeActiveFolder = async (folderId: number, folderName: string = '') => {
  automations.splice(0, automations.length)
  activeFolder.value = folderId
  let newAutomations = await getAutomations()
  newAutomations = JSON.parse(JSON.stringify(newAutomations))
  automations.push(...newAutomations)
  if (folderName === 'Шаблоны') {
    isTemplate.value = true
  } else {
    isTemplate.value = false
  }
}

const deleteFolder = async (folderId: number) => {
  const token = useCookie('boardToken').value
  const deleteFolderIndex = folders.findIndex((e: any) => e.id === folderId)
  folders.splice(deleteFolderIndex, 1)
  if (folderId === activeFolder.value) {
    changeActiveFolder(folders[0].id)
  }
  await useAuthFetch(`/api/v1/cms/folder/?folder_id=${folderId}`, {
    method: 'delete',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: { folder_id: folderId }
  })
}

const deleteCms = async (cmsId: number) => {
  const token = useCookie('boardToken').value
  const deleteCmsIndex = automations.findIndex((e: any) => e.id === cmsId)
  await useAuthFetch(`/api/v1/cms/automatization/?automatization_id=${cmsId}`, {
    method: 'delete',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: { automatization_id: cmsId, is_template: automations[deleteCmsIndex].is_template }
  })
  automations.splice(deleteCmsIndex, 1)
}

const openEditPopup = (type: string, item: any) => {
  editSettings.type = type
  editSettings.currentItem = item
  editSettings.isOpen = true
  item.menu_active = false
}
</script>

<style scoped lang="scss">
.automatization-group{
    height: 100%;
    display: flex;
    .folders{
        padding-right: 15px;
        min-width: 300px;
        width: 300px;
        border-right: 2px solid rgba(197, 204, 230, 0.1);
        &__header{
            margin-bottom: 25px;
            text-align: center;
            padding-top: 20px;
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-semibold);
        }
        &__content{
            display: flex;
            flex-direction: column;
            gap: 10px;
            .folder{
                position: relative;
                &__inner{
                    z-index: 1;
                    transition: 0.2s;
                    width: 100%;
                    cursor: pointer;
                    padding: 7px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    .name{
                        font-weight: var(--font-weight-medium);
                    }
                    .context{
                        z-index: 101;
                        margin-left: auto;
                        cursor: pointer;
                    }
                    &:hover{
                        border-radius: 8px;
                        background: var(--additional-bg);
                    }
                }
                &__menu{
                    z-index: 500;
                    right: 0px;
                    position: absolute;
                    border-radius: 8px;
                    background: var(--additional-box);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 12px 0;
                    .func{
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        transition: 0.4s;
                        padding: 0 12px;
                        height: 35px;
                        cursor: pointer;
                        width: 100%;
                        &_delete{
                            color: var(--text-error-color)
                        }
                        &:hover{
                            background: #51535a;
                        }
                    }
                }
            }
            .add-folder{
                margin-top: 15px;
                width: 100%;
            }
        }
    }
    .automations{
        padding-left: 25px;
        &__header{
            margin-bottom: 25px;
            padding-top: 20px;
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-semibold);
        }
        &__content{
            .header{
                margin-bottom: 25px;
                display: grid;
                align-items: center;
                grid-template-columns: 450px 205px 63px 200px;
                &__item{
                    &:first-child{
                        padding-left: 35px;
                    }
                }
            }
            .automation{
                position: relative;
                &:not(:last-child){
                    margin-bottom: 15px;
                }
                &__inner{
                    transition: 0.5s;
                    cursor: pointer;
                    background: var(--additional-bg);
                    border-radius: 8px;
                    padding: 15px;
                    display: grid;
                    align-items: center;
                    grid-template-columns: 20px 490px 137px 55px 200px 200px;
                    .status{
                        width: 8px;
                        height: 8px;
                        border-radius: 100%;
                        background: var(--error-color-light);
                        &_active{
                            background: var(--success);
                        }
                    }
                    .name{
                        font-size: var(--font-size-md);
                        font-weight: var(--font-weight-semibold);
                    }
                    &:hover{
                        transform: scale(1.02);
                    }
                }
                .context{
                    cursor: pointer;
                    position: absolute;
                    display: flex;
                    right: 0;
                    top: 0;
                    align-items: center;
                    justify-content: center;
                    width: 50px;
                    height: 50px;
                }
                &__menu{
                    z-index: 500;
                    right: 0px;
                    bottom: -94px;
                    position: absolute;
                    border-radius: 8px;
                    background: var(--additional-box);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 12px 0;
                    .func{
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        transition: 0.4s;
                        padding: 0 12px;
                        height: 35px;
                        cursor: pointer;
                        width: 100%;
                        &_delete{
                            color: var(--text-error-color)
                        }
                        &:hover{
                            background: #51535a;
                        }
                    }
                }
            }
        }
    }
}

a{
    color: white;
}
</style>
