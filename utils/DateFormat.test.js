const formatDateFromIsoString = require("./DateFormat");
test("get ist date from iso string", () => {
  isoDateString = "2020-07-09T20:31:00.487Z";
  expect(formatDateFromIsoString(isoDateString)).toBe("10/07/2020 2:15:38 AM");
});
