document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector(".about-root");
  const langButtons = document.querySelectorAll(".lang-btn");
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".hero-dot");
  const prevBtn = document.querySelector(".hero-nav-prev");
  const nextBtn = document.querySelector(".hero-nav-next");

  let currentSlide = 0;
  let slideTimer = null;

  let semesterChart = null;
  let englishChart = null;
  let physicsChart = null;
  let gsatChart = null;

  const chartText = {
    zh: {
      semesterLabels: ["高一上", "高一下", "高二上", "高二下", "高三上", "高三下(預測)"],
      physicsLabels: ["高一", "選修一", "選修二", "選修三", "選修四", "選修五(預測)"],
      gsatLabels: ["國文", "英文", "自然", "數學A", "數學B", "社會"],
      semesterDataset: "學期總成績",
      myScore: "我的成績",
      classAvg: "班平均",
      gsatDataset: "學測成績",
      examText: "學科能力測驗",
      notTaken: "未報考",
      scorePrefix: "分數：",
      markerText: "學測"
    },
    en: {
      semesterLabels: ["Year 1-1", "Year 1-2", "Year 2-1", "Year 2-2", "Year 3-1", "Year 3-2 (Pred.)"],
      physicsLabels: ["Year 1", "Elective 1", "Elective 2", "Elective 3", "Elective 4", "Elective 5 (Pred.)"],
      gsatLabels: ["Chinese", "English", "Science", "Math A", "Math B", "Social Studies"],
      semesterDataset: "Semester Average",
      myScore: "My Score",
      classAvg: "Class Average",
      gsatDataset: "GSAT",
      examText: "GSAT",
      notTaken: "Not Taken",
      scorePrefix: "Score: ",
      markerText: "GSAT"
    }
  };

  const chartData = {
    semester: [72.0, 70.5, 74.7, 73.3, 56.8, 62.0],
    englishMine: [66, 69, 72, 73, 62, 66],
    englishAvg: [69, 67.5, 71.4, 65.9, 63.3, 64.5],
    physicsMine: [86, 75, 73, 63, 65, 67],
    physicsAvg: [72.7, 73, 72.6, 60, 63, 64],
    gsat: [10, 13, 10, 8, 0, 0]
  };

  function getCurrentLang() {
    return root?.getAttribute("data-current-lang") || "zh";
  }

  function setLanguage(lang) {
    if (!root) return;
    root.setAttribute("data-current-lang", lang);

    langButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.setLang === lang);
    });

    updateChartsLanguage();
  }

  function showSlide(index) {
    if (!slides.length) return;
    currentSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === currentSlide);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentSlide);
    });
  }

  function restartSlideshow() {
    clearInterval(slideTimer);
    slideTimer = setInterval(() => showSlide(currentSlide + 1), 5000);
  }

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setLanguage(btn.dataset.setLang);
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 50);
    });
  });

  prevBtn?.addEventListener("click", () => {
    showSlide(currentSlide - 1);
    restartSlideshow();
  });

  nextBtn?.addEventListener("click", () => {
    showSlide(currentSlide + 1);
    restartSlideshow();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      showSlide(i);
      restartSlideshow();
    });
  });

  setLanguage("zh");
  showSlide(0);
  restartSlideshow();

  if (typeof Chart === "undefined") {
    console.error("Chart.js not loaded");
    return;
  }

  Chart.defaults.color = "#77513b";
  Chart.defaults.font.family = "Inter, Noto Sans TC, sans-serif";
  Chart.defaults.borderColor = "rgba(119, 81, 59, 0.08)";

  function getExamMidX(scale) {
    const x1 = scale.getPixelForValue(4);
    const x2 = scale.getPixelForValue(5);
    return (x1 + x2) / 2;
  }

  const examMarkerPlugin = {
    id: "examMarkerPlugin",
    afterDraw(chart) {
      const canvasId = chart.canvas.id;
      if (!["semesterChart", "englishChart", "physicsChart"].includes(canvasId)) return;

      const lang = getCurrentLang();
      const t = chartText[lang];
      const { ctx, chartArea, scales } = chart;
      if (!chartArea || !scales?.x) return;

      const x = getExamMidX(scales.x);

      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "rgba(124, 76, 44, 0.75)";
      ctx.lineWidth = 2;
      ctx.moveTo(x, chartArea.top + 18);
      ctx.lineTo(x, chartArea.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#7b4e33";
      ctx.font = "12px Inter, Noto Sans TC, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(t.markerText, x, chartArea.top + 12);
      ctx.restore();
    }
  };

  const gsatLabelPlugin = {
    id: "gsatLabelPlugin",
    afterDatasetsDraw(chart) {
      if (chart.canvas.id !== "gsatChart") return;

      const lang = getCurrentLang();
      const t = chartText[lang];
      const { ctx, chartArea } = chart;
      const meta = chart.getDatasetMeta(0);
      if (!meta?.data || !chartArea) return;

      ctx.save();
      ctx.fillStyle = "#8b6c59";
      ctx.font = "11px Inter, Noto Sans TC, sans-serif";
      ctx.textAlign = "center";

      meta.data.forEach((bar, i) => {
        const label = chartData.gsat[i] === 0 ? t.notTaken : String(chartData.gsat[i]);
        const y = Math.max(bar.y - 14, chartArea.top + 28);
        ctx.fillText(label, bar.x, y);
      });

      ctx.restore();
    }
  };

  const englishPointLabelPlugin = {
    id: "englishPointLabelPlugin",
    afterDatasetsDraw(chart) {
      if (chart.canvas.id !== "englishChart") return;

      const { ctx, chartArea } = chart;
      const meta0 = chart.getDatasetMeta(0);
      const meta1 = chart.getDatasetMeta(1);
      if (!meta0?.data || !meta1?.data || !chartArea) return;

      ctx.save();
      ctx.font = "11px Inter, Noto Sans TC, sans-serif";
      ctx.textAlign = "center";

      meta0.data.forEach((point, i) => {
        const y = Math.max(point.y - 10, chartArea.top + 18);
        ctx.fillStyle = "#7a4f35";
        ctx.fillText(String(chartData.englishMine[i]), point.x, y);
      });

      meta1.data.forEach((point, i) => {
        const y = Math.min(point.y + 18, chartArea.bottom - 6);
        ctx.fillStyle = "#6c7a5d";
        ctx.fillText(String(chartData.englishAvg[i]), point.x, y);
      });

      ctx.restore();
    }
  };

  function commonLineOptions(min, max) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      layout: {
        padding: {
          top: 24
        }
      },
      plugins: {
        legend: {
          labels: {
            color: "#6c4630"
          }
        },
        tooltip: {
          backgroundColor: "rgba(102, 66, 42, 0.92)",
          titleColor: "#fff7f1",
          bodyColor: "#fff7f1",
          padding: 12
        }
      },
      scales: {
        x: {
          ticks: {
            color: "#77513b",
            maxRotation: 0,
            minRotation: 0,
            autoSkip: false
          },
          grid: {
            color: "rgba(119, 81, 59, 0.08)"
          }
        },
        y: {
          min,
          max,
          ticks: {
            color: "#77513b"
          },
          grid: {
            color: "rgba(119, 81, 59, 0.08)"
          }
        }
      }
    };
  }

  function createCharts() {
    const lang = getCurrentLang();
    const t = chartText[lang];

    const semesterCanvas = document.getElementById("semesterChart");
    const englishCanvas = document.getElementById("englishChart");
    const physicsCanvas = document.getElementById("physicsChart");
    const gsatCanvas = document.getElementById("gsatChart");

    if (!semesterCanvas || !englishCanvas || !physicsCanvas || !gsatCanvas) {
      console.warn("Some canvas elements are missing");
      return;
    }

    semesterChart = new Chart(semesterCanvas, {
      type: "line",
      data: {
        labels: t.semesterLabels,
        datasets: [{
          label: t.semesterDataset,
          data: chartData.semester,
          borderColor: "#b8744f",
          backgroundColor: "rgba(219, 161, 116, 0.15)",
          pointBackgroundColor: "#8b5e3c",
          pointBorderColor: "#fff",
          pointRadius: 5,
          borderWidth: 3,
          tension: 0,
          fill: false,
          segment: {
            borderDash: (ctx) => ctx.p0DataIndex === 4 ? [8, 6] : undefined
          }
        }]
      },
      options: {
        ...commonLineOptions(50, 80),
        plugins: {
          ...commonLineOptions(50, 80).plugins,
          legend: { display: false }
        }
      },
      plugins: [examMarkerPlugin]
    });

    physicsChart = new Chart(physicsCanvas, {
      type: "line",
      data: {
        labels: t.physicsLabels,
        datasets: [
          {
            label: t.myScore,
            data: chartData.physicsMine,
            borderColor: "#b56e44",
            pointBackgroundColor: "#7a4f35",
            pointBorderColor: "#fff",
            pointRadius: 4.5,
            borderWidth: 3,
            tension: 0,
            fill: false,
            segment: {
              borderDash: (ctx) => ctx.p0DataIndex === 4 ? [8, 6] : undefined
            }
          },
          {
            label: t.classAvg,
            data: chartData.physicsAvg,
            borderColor: "#87a0a4",
            pointBackgroundColor: "#5f7b80",
            pointBorderColor: "#fff",
            pointRadius: 4,
            borderWidth: 3,
            tension: 0,
            fill: false,
            segment: {
              borderDash: (ctx) => ctx.p0DataIndex === 4 ? [8, 6] : undefined
            }
          }
        ]
      },
      options: commonLineOptions(55, 90),
      plugins: [examMarkerPlugin]
    });

    gsatChart = new Chart(gsatCanvas, {
      type: "bar",
      data: {
        labels: t.gsatLabels,
        datasets: [{
          label: t.gsatDataset,
          data: chartData.gsat,
          backgroundColor: [
            "#dba174",
            "#c68759",
            "#dbb551",
            "#b56c46",
            "rgba(160,160,160,0.35)",
            "rgba(160,160,160,0.35)"
          ],
          borderRadius: 10,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        layout: {
          padding: {
            top: 28
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(102, 66, 42, 0.92)",
            titleColor: "#fff7f1",
            bodyColor: "#fff7f1",
            callbacks: {
              label: (context) => {
                return context.dataIndex >= 4
                  ? t.notTaken
                  : `${t.scorePrefix}${context.raw}`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: "#77513b" },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            max: 15,
            ticks: {
              color: "#77513b",
              stepSize: 3
            },
            grid: {
              color: "rgba(119, 81, 59, 0.08)"
            }
          }
        }
      },
      plugins: [gsatLabelPlugin]
    });

    englishChart = new Chart(englishCanvas, {
      type: "line",
      data: {
        labels: t.semesterLabels,
        datasets: [
          {
            label: t.myScore,
            data: chartData.englishMine,
            borderColor: "#c07b52",
            pointBackgroundColor: "#8b5e3c",
            pointBorderColor: "#fff",
            pointRadius: 4.5,
            borderWidth: 3,
            tension: 0,
            fill: false,
            segment: {
              borderDash: (ctx) => ctx.p0DataIndex === 4 ? [8, 6] : undefined
            }
          },
          {
            label: t.classAvg,
            data: chartData.englishAvg,
            borderColor: "#8f9d7a",
            pointBackgroundColor: "#7b8769",
            pointBorderColor: "#fff",
            pointRadius: 4,
            borderWidth: 3,
            tension: 0,
            fill: false,
            segment: {
              borderDash: (ctx) => ctx.p0DataIndex === 4 ? [8, 6] : undefined
            }
          }
        ]
      },
      options: commonLineOptions(55, 78),
      plugins: [examMarkerPlugin, englishPointLabelPlugin]
    });
  }

  function updateChartsLanguage() {
    if (!semesterChart || !englishChart || !physicsChart || !gsatChart) return;

    const lang = getCurrentLang();
    const t = chartText[lang];

    semesterChart.data.labels = t.semesterLabels;
    semesterChart.data.datasets[0].label = t.semesterDataset;
    semesterChart.update();

    physicsChart.data.labels = t.physicsLabels;
    physicsChart.data.datasets[0].label = t.myScore;
    physicsChart.data.datasets[1].label = t.classAvg;
    physicsChart.update();

    gsatChart.data.labels = t.gsatLabels;
    gsatChart.data.datasets[0].label = t.gsatDataset;
    gsatChart.update();

    englishChart.data.labels = t.semesterLabels;
    englishChart.data.datasets[0].label = t.myScore;
    englishChart.data.datasets[1].label = t.classAvg;
    englishChart.update();
  }

  createCharts();
});
