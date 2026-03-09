<template>
  <div class="bottom-bar">

    <div class="bottom-circle">
      <span v-if="formData.no_of_persons">
        {{ formData.no_of_persons }}
      </span>
      <span v-else>--</span>
    </div>

    <div class="bottom-info">

      <div class="date">
        {{ formattedDate }}
      </div>

      <div class="time">
        {{ formattedTime }}
      </div>

    </div>

    <button
      class="bottom-button"
      :disabled="!isReady"
      @click="handleReserve"
    >
      Забронировать
    </button>

  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

interface ReservationForm {
  walkin_date: string
  walkin_time: string
  no_of_persons: number
  full_name: string
  mobile: string
  placement_uuid: string
  table_uuid: string
}

const props = defineProps<{
  formData: ReservationForm
  onReserve: () => void
}>()

const isReady = computed(() => {

  const f = props.formData

  return (
    !!f.walkin_date &&
    !!f.walkin_time &&
    !!f.no_of_persons &&
    !!f.full_name &&
    !!f.mobile &&
    !!f.placement_uuid &&
    !!f.table_uuid
  )

})

function handleReserve() {

  if (!isReady.value) return

  props.onReserve()

}

const formattedDate = computed(() => {

  const date = props.formData.walkin_date

  if (!date) return "Выберите дату"

  const [y, m, d] = date.split("-")

  const dt = new Date(
    Number(y),
    Number(m) - 1,
    Number(d)
  )

  return dt.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long"
  })

})

const formattedTime = computed(() => {

  const time = props.formData.walkin_time

  if (!time) return "Выберите время"

  const [h, m] = time.split(":")

  return `${h}:${m}`

})
</script>

<style scoped>
@import "./Footer.css";
</style>