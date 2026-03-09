<template>
  <div class="step1">
    <Logo />

    <div class="form-card">
      <div class="progress-pill">
        Онлайн бронирование
      </div>

      <div class="form-group" :class="{ 'has-error': errors.walkin_date }">
        <label for="walkin_date">Дата визита</label>

        <input
          id="walkin_date"
          type="date"
          v-model="formData.walkin_date"
          :min="today"
        />

        <div v-if="errors.walkin_date" class="error-text">
          {{ errors.walkin_date }}
        </div>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.walkin_time }">
        <label for="walkin_time">Время визита</label>

        <input
          id="walkin_time"
          type="time"
          v-model="formData.walkin_time"
          :disabled="!formData.walkin_date"
          min="10:00"
          max="23:00"
        />

        <div v-if="errors.walkin_time" class="error-text">
          {{ errors.walkin_time }}
        </div>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.no_of_persons }">
        <label for="no_of_persons">Количество гостей</label>

        <input
          id="no_of_persons"
          type="number"
          v-model.number="formData.no_of_persons"
          :min="1"
          :max="maxCapacity"
        />

        <div v-if="errors.no_of_persons" class="error-text">
          {{ errors.no_of_persons }}
        </div>

        <div v-if="maxCapacity" class="hint">
          Максимум гостей: {{ maxCapacity }}
        </div>
      </div>

      <div v-if="apiMessage" :class="['api-alert', apiType]">
        {{ apiMessage }}
      </div>

      <div class="navigation">
        <span class="dots">
          <span class="active"></span>
          <span></span>
          <span></span>
        </span>

        <button
          class="next"
          @click="handleNext"
          :disabled="!isValid || loading"
        >
          <span v-if="!loading">→</span>
          <span v-else>…</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from "vue"
import Logo from "../logo.vue"
import { getMaxCapacity } from "../../api"

const props = defineProps<{
  onNext: () => void
  setFormData: (updater: (prev: any) => any) => void
  initialData?: any
}>()

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const formData = reactive({
  walkin_date: props.initialData?.walkin_date ?? "",
  walkin_time: props.initialData?.walkin_time ?? "",
  no_of_persons: props.initialData?.no_of_persons ?? 1,
  timezone
})

const maxCapacity = ref(1)
const loading = ref(false)

const apiMessage = ref("")
const apiType = ref<"error" | "warning" | "success">("error")

const errors = reactive({
  walkin_date: "",
  walkin_time: "",
  no_of_persons: ""
})

const today = new Date().toISOString().split("T")[0]

function isPastTime(time: string) {
  if (!formData.walkin_date) return false

  if (formData.walkin_date !== today) return false

  const now = new Date()

  const parts = time.split(":")
  const h = Number(parts[0] ?? 0)
  const m = Number(parts[1] ?? 0)

  const selected = new Date()
  selected.setHours(h, m, 0, 0)

  return selected < now
}

onMounted(async () => {
  try {
    loading.value = true

    const res = await getMaxCapacity()

    const capacity =
      res?.data?.max_capacity ??
      res?.max_capacity ??
      res?.data

    const parsed = Number(capacity)

    if (!isNaN(parsed) && parsed > 0) {
      maxCapacity.value = parsed
    }

  } catch {
    apiMessage.value = "Не удалось загрузить лимит гостей"
    apiType.value = "warning"
  } finally {
    loading.value = false
  }
})

function validate() {
  errors.walkin_date = ""
  errors.walkin_time = ""
  errors.no_of_persons = ""

  if (!formData.walkin_date) {
    errors.walkin_date = "Выберите дату"
  }

  if (!formData.walkin_time) {
    errors.walkin_time = "Выберите время"
  } else if (isPastTime(formData.walkin_time)) {
    errors.walkin_time = "Нельзя выбрать прошедшее время"
  }

  if (!formData.no_of_persons) {
    errors.no_of_persons = "Введите количество гостей"
  } else if (
    formData.no_of_persons < 1 ||
    formData.no_of_persons > maxCapacity.value
  ) {
    errors.no_of_persons = `Допустимо от 1 до ${maxCapacity.value}`
  }
}

const isValid = computed(() => {
  validate()

  return (
    !errors.walkin_date &&
    !errors.walkin_time &&
    !errors.no_of_persons
  )
})

watch(
  () => formData.walkin_date,
  () => {
    formData.walkin_time = ""
  }
)

watch(
  () => ({ ...formData }),
  (val) => {
    props.setFormData((prev: any) => ({
      ...(prev || {}),
      ...val
    }))
  },
  { deep: true }
)

function handleNext() {
  validate()

  if (!isValid.value) {
    apiMessage.value = "Пожалуйста, исправьте ошибки"
    apiType.value = "error"
    return
  }

  props.onNext()
}
</script>

<style scoped>
@import "./Step1.css";

.has-error input {
  border: 1px solid #e05a4f;
}

.error-text {
  color: #e05a4f;
  font-size: 13px;
  margin-top: 6px;
}

.hint {
  color: #666;
  font-size: 13px;
  margin-top: 6px;
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