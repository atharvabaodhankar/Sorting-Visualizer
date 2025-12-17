export const mergeSort = async (arr, { updateArray, setComparisons, setSwaps, setCurrentStep, setSortedIndices }) => {
    let mergePassCounter = 0;

    const merge = async (arr, start, mid, end, passId) => {
        const left = arr.slice(start, mid + 1);
        const right = arr.slice(mid + 1, end + 1);
        let i = 0, j = 0, k = start;
        setCurrentStep(`Merging subarrays from ${start} to ${end}`);
        while (i < left.length && j < right.length) {
            setComparisons(c => c + 1);
            if (!await updateArray(arr, [k, start + i, mid + 1 + j], [], passId)) return;
            if (left[i].value <= right[j].value) { arr[k] = left[i]; i++; } 
            else { arr[k] = right[j]; j++; }
            setSwaps(s => s + 1); k++;
        }
        while (i < left.length) {
            arr[k] = left[i];
            if (!await updateArray(arr, [k], [], passId)) return;
            i++; k++;
        }
        while (j < right.length) {
            arr[k] = right[j];
            if (!await updateArray(arr, [k], [], passId)) return;
            j++; k++;
        }
    };

    const sort = async (arr, start, end) => {
        if (start >= end) return;
        const mid = Math.floor((start + end) / 2);
        setCurrentStep(`Dividing array: [${start}...${mid}] and [${mid + 1}...${end}]`);
        await sort(arr, start, mid);
        await sort(arr, mid + 1, end);
        mergePassCounter++;
        await merge(arr, start, mid, end, mergePassCounter);
    };

    await sort(arr, 0, arr.length - 1);
    setSortedIndices(Array.from({ length: arr.length }, (_, i) => i));
    setCurrentStep('Sorting complete!');
};
