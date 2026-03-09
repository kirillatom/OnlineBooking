<template>
  <div id="app">

    <div class="wizard">

      <Step1
        v-if="step === 1"
        :formData="formData"
        :setFormData="updateFormData"
        @next="goToStep2"
      />

      <Step2
        v-if="step === 2"
        :formData="formData"
        :setFormData="updateFormData"
        @next="goToStep3"
        @back="goToStep1"
      />

      <Step3
        v-if="step === 3"
        ref="step3Ref"
        :formData="formData"
        :setFormData="updateFormData"
        @back="goToStep2"
        @submit="handleReservationSuccess"
      />

    </div>

    <Footer
      :formData="formData"
      :onReserve="handleReserveClick"
    />

  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

import Step1 from "./components/steps/Step1.vue"
import Step2 from "./components/steps/Step2.vue"
import Step3 from "./components/steps/Step3.vue"
import Footer from "./components/Footer.vue"

interface ReservationForm {
  walkin_date: string
  walkin_time: string
  no_of_persons: number
  full_name: string
  mobile: string
  placement_uuid: string
  table_uuid: string
  timezone: string
  is_vip: boolean
}

const step = ref(1)

const step3Ref = ref<any>(null)

const defaultForm: ReservationForm = {
  walkin_date: "",
  walkin_time: "",
  no_of_persons: 1,
  full_name: "",
  mobile: "",
  placement_uuid: "",
  table_uuid: "",
  timezone: "Asia/Almaty",
  is_vip: false
}

const formData = ref<ReservationForm>({ ...defaultForm })

function updateFormData(
  updater:
    | ReservationForm
    | ((prev: ReservationForm) => ReservationForm)
) {

  formData.value =
    typeof updater === "function"
      ? updater(formData.value)
      : updater

}

function goToStep1() {
  step.value = 1
}

function goToStep2() {
  step.value = 2
}

function goToStep3() {
  step.value = 3
}

function handleReserveClick() {

  if (step.value !== 3) {
    step.value = 3
    return
  }

  step3Ref.value?.submitReservation()

}

function handleReservationSuccess() {

  alert("Бронирование успешно создано!")

  resetForm()
  goToStep1()

}

function resetForm() {

  formData.value = { ...defaultForm }

}
</script>

<style>
#app {

  display: flex;
  flex-direction: column;

  min-height: 100vh;
  width: 100%;

  background: #fafafa;

}

.wizard {

  flex: 1;

  display: flex;
  justify-content: center;
  align-items: center;

}
</style>