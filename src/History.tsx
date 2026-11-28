import {Pressable, SectionList, Text, View} from 'react-native';
import {useState} from 'react';
import dayjs from 'dayjs';
import {useLedger} from './useLedger';
import {LoadState} from './components';
import {Month, money} from './model';

type YearSection = {year: string; data: Month[]};

function Row({label,value,tone}: {label:string; value:number; tone:string}) {
  return <View className="mt-2 flex-row justify-between gap-2"><Text className="text-stone-600">{label}</Text>
    <Text className={tone}>{money(value)}</Text></View>;
}
export default function History() {
  const {data,failed,failureMessage,retry} = useLedger();
  const [expandedMonth,setExpandedMonth] = useState<string>();
  if (!data || failed) return <LoadState failed={failed} failureMessage={failureMessage} retry={retry}/>;
  const sections: YearSection[] = [];
  for (const month of data.history) {
    const year = month.month_key.slice(0, 4);
    let section = sections.find(item => item.year === year);
    if (!section) {
      section = {year, data: []};
      sections.push(section);
    }
    section.data.push(month);
  }
  return <SectionList<Month, YearSection> className="bg-stone-50" contentContainerStyle={{padding:20}}
    sections={sections} stickySectionHeadersEnabled={false} keyExtractor={m=>m.month_key}
    renderSectionHeader={({section})=><Text className="mb-2 mt-3 text-2xl font-bold text-teal-900">
      {section.year}
    </Text>}
    renderItem={({item:m})=>{
      const expanded = expandedMonth === m.month_key;
      const monthName = dayjs(m.month_key+'-01').format('MMMM');
      return <View className="mb-3 rounded-2xl bg-white px-5 py-4">
        <Pressable accessibilityRole="button"
          accessibilityLabel={`${expanded ? 'Hide' : 'Show'} ${monthName} report`}
          accessibilityState={{expanded}}
          onPress={()=>setExpandedMonth(expanded ? undefined : m.month_key)}
          className="flex-row items-center justify-between">
          <Text className="text-xl font-bold">{monthName}</Text>
          <Text className="px-2 text-xl font-bold text-teal-800">{expanded ? '−' : '+'}</Text>
        </Pressable>
        {expanded && <>
          <Row label="Opening balance" value={m.opening_balance} tone="text-stone-800"/>
          <Row label="Income" value={m.total_income} tone="text-emerald-700"/>
          <Row label="Expenses" value={m.total_expense} tone="text-rose-700"/>
          {m.credit_expense > 0 && <Row label="Of which, credit purchases" value={m.credit_expense} tone="text-rose-700"/>}
          {m.loan_net !== 0 && <Row label="Net loan activity" value={m.loan_net} tone="text-teal-800"/>}
          <View className="mt-3 border-t border-stone-200 pt-1"><Row label="Closing balance" value={m.closing_balance}
            tone={m.closing_balance < 0 ? 'font-bold text-red-700' : m.closing_balance > 0 ? 'font-bold text-green-700' : 'font-bold text-stone-800'}/></View>
        </>}
      </View>;
    }}/>;
}
