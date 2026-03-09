<template>
  <div class="step2">
    <Logo />

    <div class="form-card">
      <div class="progress-pill">
        Онлайн бронирование
      </div>

      <div class="form-group" :class="{ 'has-error': errors.full_name }">
        <label for="full_name">Ваше имя</label>

        <input
          id="full_name"
          type="text"
          placeholder="Введите имя"
          v-model="formData.full_name"
          @input="clearError('full_name')"
        />

        <div v-if="errors.full_name" class="error-text">
          {{ errors.full_name }}
        </div>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.mobile }">
        <label for="mobile">Телефон</label>

        <input
          id="mobile"
          type="tel"
          maxlength="18"
          placeholder="+7 (___) ___-__-__"
          :value="formData.mobile"
          @input="onPhoneInput"
        />

        <div v-if="errors.mobile" class="error-text">
          {{ errors.mobile }}
        </div>

        <div v-if="!formData.mobile" class="hint">
          Формат: +7 (999) 999-99-99
        </div>
      </div>

      <div class="form-group vip">
        <label class="vip-label">
          <input type="checkbox" v-model="formData.is_vip" />
          VIP гость
        </label>
      </div>

      <div v-if="apiMessage" :class="['api-alert', apiType]">
        {{ apiMessage }}
      </div>

      <div class="navigation">
        <button class="back" @click="props.onBack" type="button">
          ←
        </button>

        <span class="dots">
          <span></span>
          <span class="active"></span>
          <span></span>
        </span>

        <button
          class="next"
          @click="handleNext"
          :disabled="!isValid"
          type="button"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch, ref } from "vue"
import Logo from "../logo.vue"

interface Step2Form {
  full_name: string
  mobile: string
  timezone: string
  is_vip: boolean
}

const props = defineProps<{
  onNext: () => void
  onBack: () => void
  setFormData: (updater: (prev: any) => any) => void
  initialData?: Partial<Step2Form>
}>()

const formData = reactive<Step2Form>({
  full_name: props.initialData?.full_name ?? "",
  mobile: props.initialData?.mobile ?? "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  is_vip: props.initialData?.is_vip ?? false
})

const apiMessage = ref("")
const apiType = ref<"error" | "warning" | "success">("error")

const errors = reactive({
  full_name: "",
  mobile: ""
})


function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)

  if (!digits) return ""

  let result = "+7"

  if (digits.length > 1) {
    result += " (" + digits.slice(1, 4)
  }

  if (digits.length >= 4) {
    result += ") " + digits.slice(4, 7)
  }

  if (digits.length >= 7) {
    result += "-" + digits.slice(7, 9)
  }

  if (digits.length >= 9) {
    result += "-" + digits.slice(9, 11)
  }

  return result
}

function onPhoneInput(e: Event) {
  const input = e.target as HTMLInputElement
  formData.mobile = formatPhone(input.value)

  clearError("mobile")
}

function validate() {
  errors.full_name = ""
  errors.mobile = ""

  const name = formData.full_name.trim()

  if (!name) {
    errors.full_name = "Введите имя"
  } else if (!/^[A-Za-zА-Яа-яЁё\s]+$/.test(name)) {
    errors.full_name = "Имя должно содержать только буквы"
  } else if (name.length < 2) {
    errors.full_name = "Минимум 2 символа"
  }

  const digits = formData.mobile.replace(/\D/g, "")

  if (!digits) {
    errors.mobile = "Введите телефон"
  } else if (digits.length < 11) {
    errors.mobile = "Введите полный номер"
  }
}

const isValid = computed(() => {
  validate()

  return !errors.full_name && !errors.mobile
})

function clearError(field: "full_name" | "mobile") {
  errors[field] = ""
}

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
@import "./Step2.css";

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

.vip {
  margin-top: 14px;
}

.vip-label {
  display: flex;
  align-items: center;
  gap: 8px;
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