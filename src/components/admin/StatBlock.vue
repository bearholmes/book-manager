<template>
  <container class="mt-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="py-3 px-10 col- bg-white border border-transparent rounded-md shadow-sm">
        <strong class="block text-left my-4 text-bold text-gray-900">카테고리별</strong>
        <div class="max-w-sm mx-auto">
          <Chart v-if="isRender" id="optionTopicResult" type="doughnut" :option="optionTopicResult" :data="dataTopicResult" />
        </div>
        <table class="min-w-full divide-y divide-gray-300">
          <caption class="sr-only">
            카테고리별
          </caption>
          <thead class="text-gray-700">
            <tr>
              <th scope="col" class="py-1.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6 md:pl-0">카테고리</th>
              <th scope="col" class="py-1.5 pl-3 pr-4 text-right text-sm font-semibold sm:pr-6 md:pr-0">권수</th>
              <th scope="col" class="py-1.5 pl-3 pr-4 text-right text-sm font-semibold sm:pr-6 md:pr-0">금액</th>
              <th scope="col" class="hidden sm:table-cell py-1.5 pl-3 pr-4 text-right text-sm font-semibold sm:pr-6 md:pr-0">평균</th>
            </tr>
          </thead>
          <tbody class="text-gray-500">
            <tr v-for="(item, idx) in topicResult" :key="idx" class="border-b border-gray-200">
              <td class="py-1 pl-4 pr-3 text-sm sm:pl-6 md:pl-0">
                {{ item.name }}
              </td>
              <td class="py-1 pl-3 pr-4 text-right text-sm sm:pr-6 md:pr-0">{{ currency(item.cnt) }}권</td>
              <td class="py-1 pl-3 pr-4 text-right text-sm sm:pr-6 md:pr-0">{{ currency(item.cost) }}원</td>
              <td class="hidden sm:table-cell py-1 pl-3 pr-4 text-right text-sm sm:pr-6 md:pr-0">
                {{ currency((item.cost / item.cnt).toFixed(0)) }}원
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-b border-gray-200">
              <td class="py-1 pl-4 pr-3 text-sm sm:pl-6 md:pl-0">총</td>
              <td class="py-1 pl-3 pr-4 text-right text-sm sm:pr-6 md:pr-0">{{ currency(topicSummary.cnt) }}권</td>
              <td class="py-1 pl-3 pr-4 text-right text-sm sm:pr-6 md:pr-0">{{ currency(topicSummary.cost) }}원</td>
              <td class="hidden sm:table-cell py-1 pl-3 pr-4 text-right text-sm sm:pr-6 md:pr-0">
                {{ currency((topicSummary.cost / topicSummary.cnt).toFixed(0)) }}원
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="py-3 px-10 col- bg-white border border-transparent rounded-md shadow-sm">
        <strong class="block text-left my-4 text-bold text-gray-900">구매 기간별</strong>
        <div class="max-w-sm mx-auto py-3 sm:py-10">
          <Chart v-if="isRender" id="dataDateResult" type="bar" :option="optionDateResult" :data="dataDateResult" />
        </div>
        <table class="min-w-full divide-y divide-gray-300">
          <caption class="sr-only">
            구매 기간별
          </caption>
          <thead class="text-gray-700">
            <tr>
              <th scope="col" class="py-1.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6 md:pl-0">기간</th>
              <th scope="col" class="py-1.5 pl-3 pr-4 text-right text-sm font-semibold sm:pr-6 md:pr-0">권수</th>
              <th scope="col" class="py-1.5 pl-3 pr-4 text-right text-sm font-semibold sm:pr-6 md:pr-0">금액</th>
            </tr>
          </thead>
          <tbody class="text-gray-500">
            <template v-for="(item, idx) in dateResult" :key="`year${idx}`">
              <tr class="border-b border-gray-200 font-semibold">
                <td class="py-1 pl-4 pr-3 text-sm sm:pl-6 md:pl-0">
                  <button type="button" class="font-semibold hover:text-blue-500" @click="item.show = !item.show">
                    <ChevronRightIcon v-if="!item.show" class="inline-block h-3 w-3" aria-hidden="true" />
                    <ChevronDownIcon v-if="item.show" class="inline-block h-3 w-3" aria-hidden="true" />
                    {{ item.year }}년
                    <span class="sr-only">{{ item.show ? '펼쳐짐' : '접힘' }}</span>
                  </button>
                </td>
                <td class="py-1 pl-3 pr-4 text-right text-sm sm:pr-6 md:pr-0">{{ currency(item.cnt) }}권</td>
                <td class="py-1 pl-3 pr-4 text-right text-sm sm:pr-6 md:pr-0">{{ currency(item.sum) }}원</td>
              </tr>
              <tr
                v-for="(mItem, mIdx) in item.months"
                :key="`year${idx}_month${mIdx}`"
                class="border-b border-gray-200 bg-gray-50"
                :class="{ hidden: !item.show }"
              >
                <td class="py-1 pl-7 pr-3 text-sm sm:pl-6 md:pl-4">{{ mItem.month }}월</td>
                <td class="py-1 pl-3 pr-4 text-right text-sm sm:pr-6 md:pr-0">{{ currency(mItem.cnt) }}권</td>
                <td class="py-1 pl-3 pr-4 text-right text-sm sm:pr-6 md:pr-0">{{ currency(mItem.sum) }}원</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <div class="py-3 px-10 col- bg-white border border-transparent rounded-md shadow-sm">
        <strong class="block text-left my-4 text-bold text-gray-900">구매처별</strong>
        <table class="min-w-full divide-y divide-gray-300">
          <caption class="sr-only">
            구매처별
          </caption>
          <thead class="text-gray-700">
            <tr>
              <th scope="col" class="py-1.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6 md:pl-0">기간</th>
              <th scope="col" class="py-1.5 pl-3 pr-4 text-right text-sm font-semibold sm:pr-6 md:pr-0">권수</th>
              <th scope="col" class="py-1.5 pl-3 pr-4 text-right text-sm font-semibold sm:pr-6 md:pr-0">금액</th>
            </tr>
          </thead>
          <tbody class="text-gray-500">
            <tr v-for="(item, idx) in placeResult" :key="idx" class="border-b border-gray-200">
              <td class="py-1 pl-4 pr-3 text-sm sm:pl-6 md:pl-0">
                {{ item.name }}
              </td>
              <td class="py-1 pl-3 pr-4 text-right text-sm sm:pr-6 md:pr-0">{{ currency(item.cnt) }}권</td>
              <td class="py-1 pl-3 pr-4 text-right text-sm sm:pr-6 md:pr-0">{{ currency(item.sum) }}원</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </container>
</template>
<script setup>
import dayjs from 'dayjs';
import { ref, watch } from 'vue';
import { orderBy } from 'lodash';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/vue/outline';
import Chart from '~/components/common/Chart';
import Container from '~/components/common/Container';
import { currency, randomBetween } from '~/utils/common';

const randomRgba = () => {
  const min = 40;
  const max = 210;
  const r = randomBetween(min, max);
  const g = randomBetween(min, max);
  const b = randomBetween(min, max);
  return {
    border: `rgba(${r},${g},${b},.8`,
    bg: `rgba(${r},${g},${b},.2)`,
  };
};

const props = defineProps({
  bookList: {
    type: Array,
    default: () => {
      return [];
    },
  },
});

const isRender = ref(false);

const topicResult = ref([]);
const topicSummary = ref({ cnt: 0, cost: 0 });
const dateResult = ref({});
const placeResult = ref({});

const optionTopicResult = ref({});
optionTopicResult.value = {
  //responsive: true,
  cutout: '60%',
  layout: {
    padding: 20,
  },
  plugins: {
    legend: {
      position: 'bottom',
    },
    datalabels: {
      display: function (context) {
        var dataset = context.dataset;
        var value = dataset.data[context.dataIndex];
        return Math.round((value / topicSummary.value.cost) * 100) >= 4;
      },
      formatter: function (value) {
        return Math.round((value / topicSummary.value.cost) * 100) + '%';
      },
    },
  },
};
const dataTopicResult = ref({});
dataTopicResult.value = {
  labels: [],
  datasets: [
    {
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
    },
  ],
};

const optionDateResult = ref({});
optionDateResult.value = {
  //responsive: true,
  cutout: '60%',
  layout: {
    padding: 20,
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
      },
    },
    datalabels: {
      display: false,
    },
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',

      // grid line settings
      grid: {
        drawOnChartArea: false, // only want the grid lines for one axis to show up
      },
    },
  },
};
const dataDateResult = ref({});
const barColor = randomRgba();
const lineColor = randomRgba();
dataDateResult.value = {
  labels: [],
  datasets: [
    {
      label: '금액',
      data: [],
      backgroundColor: [barColor.bg],
      borderColor: [barColor.border],
      borderWidth: 2,
      fill: false,
      yAxisID: 'y',
      datalabels: {
        align: 'start',
        anchor: 'start',
      },
    },
    {
      label: '권수',
      type: 'line',
      data: [],
      backgroundColor: [lineColor.border],
      borderColor: [lineColor.bg],
      pointStyle: 'rectRot',
      yAxisID: 'y1',
    },
  ],
};

watch(
  () => props.bookList,
  (val) => {
    isRender.value = false;

    topicResult.value = [];
    topicSummary.value = { cnt: 0, cost: 0 };
    dateResult.value = {};
    placeResult.value = {};
    let tmp = {};
    let tmp2 = {};
    let tmp3 = {};
    let firstYear = null;

    val.forEach((item) => {
      const c = item.purchasePrice ? (typeof item.purchasePrice === 'number' ? item.purchasePrice : Number(item.purchasePrice)) : 0;

      // 카테고리별 통계
      if (item.topic) {
        if (!tmp[item.topic]) {
          tmp[item.topic] = {
            name: item.topic,
            cnt: 0,
            cost: 0,
          };
        }
        tmp[item.topic].cost += c;
        tmp[item.topic].cnt += 1;
        topicSummary.value.cost += c;
        topicSummary.value.cnt += 1;
      }

      // 기간별 통계
      if (item.purchaseDate) {
        const year = dayjs(item.purchaseDate).year();
        const month = dayjs(item.purchaseDate).month() + 1;

        if (firstYear && year < firstYear) firstYear = year;
        else if (!firstYear) firstYear = year;

        if (!tmp2[year]) {
          tmp2[year] = {
            year: year,
            months: {},
            sum: 0,
            cnt: 0,
            show: false,
          };

          const nowYear = dayjs().year();
          const nowMonth = dayjs().month() + 1;

          const last = year === nowYear ? nowMonth : 12;

          for (let i = 0; i < last; i++) {
            tmp2[year].months[i + 1] = {
              year: year,
              month: i + 1,
              sum: 0,
              cnt: 0,
              books: [],
            };
          }
        }
        tmp2[year].sum += c;
        tmp2[year].cnt += 1;
        tmp2[year].months[month].sum += c;
        tmp2[year].months[month].cnt += 1;
        tmp2[year].months[month].books.push(item.bookName);
      }

      // 구매처별 통계
      if (item.purchasePlace) {
        if (!tmp3[item.purchasePlace]) {
          tmp3[item.purchasePlace] = {
            name: item.purchasePlace,
            cnt: 0,
            sum: 0,
          };
        }
        tmp3[item.purchasePlace].sum += c;
        tmp3[item.purchasePlace].cnt += 1;
      }
    });

    // 테이블 데이터 바이딩
    // for(const name in tmp) {
    //   topicResult.value.push(tmp[name]);
    // }
    topicResult.value = orderBy(tmp, ['cost'], ['desc']);

    if (firstYear) {
      for (let i = 0; i < 12; i++) {
        if (!tmp2[firstYear].months[i + 1].cnt) {
          delete tmp2[firstYear].months[i + 1];
        } else {
          break;
        }
      }
    }

    dateResult.value = tmp2;
    placeResult.value = orderBy(tmp3, ['cnt', 'sum'], ['desc', 'desc']);

    // 그래프용 데이터 바인딩
    dataTopicResult.value.labels = [];
    dataTopicResult.value.datasets[0].data = [];

    for (const item of topicResult.value) {
      const color = randomRgba();
      dataTopicResult.value.labels.push(item.name);
      dataTopicResult.value.datasets[0].data.push(item.cost);
      dataTopicResult.value.datasets[0].borderColor.push(color.border);
      dataTopicResult.value.datasets[0].backgroundColor.push(color.bg);
    }

    dataDateResult.value.labels = [];
    dataDateResult.value.datasets[0].data = [];
    dataDateResult.value.datasets[1].data = [];
    for (const item in dateResult.value) {
      dataDateResult.value.labels.push(item);
      dataDateResult.value.datasets[0].data.push(dateResult.value[item].sum);
      dataDateResult.value.datasets[1].data.push(dateResult.value[item].cnt);
    }

    isRender.value = true;
  },
  { deep: true, immediate: true },
);
</script>
