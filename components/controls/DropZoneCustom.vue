<template>
    <div>
        <div
            v-bind="getRootProps()"
            class="dropzone"
        >
            <input
                v-bind="getInputProps()"
                accept="image/x-png,image/gif,image/jpeg"
            >
            <div
                v-if="isDragActive"
                class="dropzone__description"
                :class="{'dropzone__description_active' : isDragActive}"
            >
                <div
                    class="title"
                >
                    Drop the files here ...
                </div>
            </div>
            <div
                v-else
                class="dropzone__description"
            >
                <svg-icon
                    width="32"
                    height="32"
                    icon="upload"
                    fill="#BAC2E0"
                    class="icon"
                />
                <div
                    class="title"
                >
                    <span class="link">Click to upload</span> or drag and drop
                </div>
                <div
                    class="subtitle"
                >
                    Maximum file size 6 MB
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useDropzone } from 'vue3-dropzone'

export default {
  name: 'DropZoneCustom',
  emits: ['upload'],
  setup (_, { emit }) {
    // const url = '{your_url}' // Your url on the server side
    // const saveFiles = (files) => {
    //   const formData = new FormData() // pass data as a form
    //   for (let x = 0; x < files.length; x++) {
    //     // append files as array to the form, feel free to change the array name
    //     formData.append('images[]', files[x])
    //   }

    //   axios
    //     .post(url, formData, {
    //       headers: {
    //         'Content-Type': 'multipart/form-data'
    //       }
    //     })
    //     .then((response) => {
    //       console.info(response.data)
    //     })
    //     .catch((err) => {
    //       console.error(err)
    //     })
    // }
    function onDrop (acceptFiles, _) {
      if (acceptFiles[0].size < 6000000) {
        // saveFiles(acceptFiles);
        emit('upload', acceptFiles[0])
      }
    }

    const { getRootProps, getInputProps, ...rest } = useDropzone({ onDrop })

    return {
      getRootProps,
      getInputProps,
      ...rest
    }
  }
}
</script>

<style lang="scss" scoped>
.dropzone{
    cursor: pointer;
    height: 185px;
    padding: 15px;
    padding-top: 45px;
    border-radius: 5px;
    background: colorOpacity(--additional-box-border, 0.4);
    border: 1px solid var(--additional-box-border);
    &:hover{
        background-color: var(--additional-box);
        .dropzone__description{
            z-index: 2;
        }
    }
    &__description{
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        width: 100%;
        height: 100%;
        &_active{
            z-index: 2;
        }
        .icon{
            margin-bottom: 10px;
        }
        .title{
            margin-bottom: 5px;
            color: #FFF;
            .link{
                color: var(--link);
                text-decoration: underline;
            }
        }
        .subtitle{
            color: var(--gray-color);
            font-size: var(--font-size-xs);
        }
    }
}
</style>
