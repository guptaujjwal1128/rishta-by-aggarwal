const delay = async (ms) => {
  return new Promise((res, rej) => {
    setTimeout(function () {
      res();
    }, ms);
  });
};

const fetchMilk = async (shouldSucceed) => {
  await delay(300);
  if (shouldSucceed) {
    return "Milk Feteched";
  } else {
    throw new Error("failed");
  }
};

const fetchSugar = async (shouldSucceed) => {
  await delay(700);
  if (shouldSucceed) {
    return "Sugar Feteched";
  } else {
    throw new Error("failed");
  }
};

const fetchTea = async (shouldSucceed) => {
  await delay(1200);
  if (shouldSucceed) {
    return "Tea Feteched";
  } else {
    throw new Error("failed");
  }
};

const makeTea = async () => {
  try {
    const milk = await fetchMilk(true);
  } catch (e) {
    throw new Error("Milk Failed");
  }
  try {
    const sugar = await fetchSugar(false);
  } catch (e) {
    throw new Error("Sugar Failed");
  }
  try {
    const tea = await fetchTea(true);
  } catch (e) {
    throw new Error("Tea Failed");
  }
  return "Tea is ready";
};

makeTea()
  .then(() => {
    console.log("Tea is ready");
  })
  .catch((err) => {
    console.log(err.message);
  });
