<template>
  <div class="step3">
    <Logo />

    <div class="form-card">
      <div class="progress-pill">
        Онлайн бронирование
      </div>

      <div class="form-group" :class="{ 'has-error': errors.placement_uuid }">
        <label>Зона / Зал</label>

        <select v-model="placementUuid" :disabled="loadingPlacements">
          <option value="">Выберите зону</option>

          <option
            v-for="placement in placements"
            :key="placement.uuid"
            :value="placement.uuid"
          >
            {{ placement.name }}
          </option>
        </select>

        <div v-if="errors.placement_uuid" class="error-text">
          {{ errors.placement_uuid }}
        </div>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.table_uuid }">
        <label>Стол</label>

        <select
          v-model="tableUuid"
          :disabled="!placementUuid || loadingTables"
        >
          <option value="">Выберите стол</option>

          <option
            v-for="table in tables"
            :key="table.uuid"
            :value="table.uuid"
          >
            {{ table.name }} ({{ table.capacity }} мест{{ table.is_vip ? ', VIP' : '' }})
          </option>
        </select>

        <div v-if="errors.table_uuid" class="error-text">
          {{ errors.table_uuid }}
        </div>
      </div>

      <div v-if="loadingTables" class="hint">
        Загрузка столов...
      </div>

      <div
        v-if="!loadingTables && placementUuid && tables.length === 0"
        class="hint"
      >
        Нет доступных столов
      </div>

      <div v-if="apiMessage" :class="['api-alert', apiType]">
        {{ apiMessage }}
      </div>

      <div class="navigation">
        <button class="back" @click="props.onBack">
          ←
        </button>

        <span class="dots">
          <span></span>
          <span></span>
          <span class="active"></span>
        </span>

        <div style="width:36px"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from "vue"
import Logo from "../logo.vue"
import { getPlacements, getTables, createReservation } from "../../api"

interface Placement {
  uuid: string
  name: string
}

interface Table {
  uuid: string
  name: string
  capacity: number
  is_vip: boolean
}

const props = defineProps<{
  onBack: () => void
  onSubmit: (res?: unknown) => void
  setFormData: (updater: (prev: any) => any) => void
  formData: any
}>()

const placements = ref<Placement[]>([])
const tables = ref<Table[]>([])

const loadingPlacements = ref(false)
const loadingTables = ref(false)
const submitting = ref(false)

const apiMessage = ref("")
const apiType = ref<"error" | "warning" | "success">("error")

const errors = reactive({
  placement_uuid: "",
  table_uuid: ""
})

const placementUuid = computed({
  get: () => props.formData?.placement_uuid ?? "",
  set: (val: string) => {
    props.setFormData((prev: any) => ({
      ...prev,
      placement_uuid: val,
      table_uuid: ""
    }))
  }
})

const tableUuid = computed({
  get: () => props.formData?.table_uuid ?? "",
  set: (val: string) => {
    props.setFormData((prev: any) => ({
      ...prev,
      table_uuid: val
    }))
  }
})

function validate() {

  errors.placement_uuid = ""
  errors.table_uuid = ""

  if (!placementUuid.value) {
    errors.placement_uuid = "Выберите зону"
  }

  if (!tableUuid.value) {
    errors.table_uuid = "Выберите стол"
  }

  return !errors.placement_uuid && !errors.table_uuid
}

onMounted(async () => {

  loadingPlacements.value = true

  try {

    const res = await getPlacements()

    const rows = res?.data?.rows ?? res?.rows ?? res?.data ?? res

    placements.value = Array.isArray(rows) ? rows : []

  } catch {

    apiMessage.value = "Не удалось загрузить список зон"
    apiType.value = "warning"

  } finally {

    loadingPlacements.value = false

  }

})

watch(
  () => placementUuid.value,
  async (placement) => {

    tables.value = []

    if (!placement) return

    loadingTables.value = true

    try {

      const filters = {
        min_capacity: Number(props.formData?.no_of_persons ?? 1),
        walkin_date: props.formData?.walkin_date,
        walkin_time: props.formData?.walkin_time,
        status: "available"
      }

      const res = await getTables(placement, filters)

      const rows = res?.data?.rows ?? res?.rows ?? res?.data ?? res

      tables.value = Array.isArray(rows) ? rows : []

    } catch {

      apiMessage.value = "Не удалось загрузить столы"
      apiType.value = "warning"

    } finally {

      loadingTables.value = false

    }

  }
)

async function submitReservation() {

  apiMessage.value = ""

  if (!validate()) return

  submitting.value = true

  try {

    const payload = {
      ...props.formData,
      placement_uuid: placementUuid.value,
      table_uuid: tableUuid.value
    }

    const res = await createReservation(payload)

    apiMessage.value = "Бронирование успешно создано"
    apiType.value = "success"

    props.onSubmit(res)

  } catch (err: any) {

    apiMessage.value = err?.message ?? "Ошибка бронирования"
    apiType.value = "error"

  } finally {

    submitting.value = false

  }
}

defineExpose({
  submitReservation
})
</script>

<style scoped>
@import "./Step3.css";

.has-error select {
  border: 1px solid #e05a4f;
}

.error-text {
  color: #e05a4f;
  font-size: 13px;
  margin-top: 6px;
}

.hint {
  margin-top: 8px;
  color: #666;
  font-size: 14px;
}

.api-alert {
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 14px;
}

.api-alert.error {
  background: #fff5f5;
  color: #b00000;
}

.api-alert.warning {
  background: #fffaf0;
  color: #8a6d00;
}

.api-alert.success {
  background: #f3fff6;
  color: #0b6b2f;
}
</style>